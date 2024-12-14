//TODO: Account Integration for audit

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
var mysql = require('mysql2');
//npm i express body-parser mysql2 axios

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

var db = mysql.createConnection({
    host: "localhost",//change to ur db
    user: "root",//change to ur db
    password: "password",//change to ur db
    database: "itisdev_db" //change to ur db
});

db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
app.get("/microservices/max_ingredient_values", (req,res)=>{
    var query =     " SELECT json_objectagg(ingredient_id, maxVals) as maxVals";
        query +=    " FROM (";
        query +=    " 	SELECT ";
        query +=    " 		i.ingredient_id AS ingredient_id";
        query +=    " 		, json_objectagg(iu.unit_id, (i.amount * iu.multiplier)) maxVals";
        query +=    " 	FROM ingredients i";
        query +=    " 	RIGHT JOIN ingredient_units iu";
        query +=    " 	ON i.ingredient_id = iu.ingredient_id";
        query +=    " 	GROUP BY i.ingredient_id";
        query +=    " ) x;";

    db.query(query, (err,results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.get("/microservices/ingredient_unit_pair", (req,res)=>{
    var query   =  " SELECT json_objectagg(ingredient_id, json_data) AS data";
        query   +=  " FROM";
        query   +=  " (SELECT";
        query   +=  " 	i.ingredient_id,";
        query   +=  "     json_merge(";
        query   +=  " 	json_object('ingredientName', i.ingredient_name),";
        query   +=  "     json_object('units',";
        query   +=  " 			json_objectagg(";
        query   +=  " 				u.unit_id,";
        query   +=  " 				CONCAT (unit_name, ' (', unit_symbol, ')')";
        query   +=  " 			)";
        query   +=  " 	)) as json_data";
        query   +=  " FROM";
        query   +=  "     ingredient_units iu";
        query   +=  "     LEFT JOIN ingredients i ON i.ingredient_id = iu.ingredient_id";
        query   +=  "     LEFT JOIN unit u ON u.unit_id = iu.unit_id";
        query   +=  " GROUP BY";
        query   +=  "     i.ingredient_id";
        query   +=  " ) x";

    db.query(query, (err,results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.get("/microservices/restock_audit", (req, res)=>{
    var query =  " SELECT";
        query += "     i.ingredient_name AS 'Ingredient',";
        query += "     u.unit_name AS 'Unit',";
        query += "     CONCAT (r.amount, u.unit_symbol) AS 'Restock Count',";
        query += "     CONCAT (fname, ' ', lname) AS 'User',";
        query += "     DATE(r.transaction_date)";
        query += " FROM";
        query += "     `restock` r";
        query += "     LEFT JOIN `account` a ON r.account_id = a.account_id";
        query += "     LEFT JOIN `ingredients` i ON i.ingredient_id = r.ingredient_id";
        query += "     LEFT JOIN `unit` u ON u.unit_id = r.unit_id";
        query += " ORDER BY r.transaction_date desc";
        db.query(query, (err,results) => {
            if (err) throw err;
            res.send(results);
        });
});

app.get("/microservices/discard_audit", (req, res)=>{
    var query =  " SELECT";
        query += "     i.ingredient_name AS 'Ingredient',";
        query += "     u.unit_name AS 'Unit',";
        query += "     CONCAT (r.amount, u.unit_symbol) AS 'Restock Count',";
        query += "     CONCAT (fname, ' ', lname) AS 'User',";
        query += "     DATE(r.transaction_date)";
        query += " FROM";
        query += "     `discard` r";
        query += "     LEFT JOIN `account` a ON r.account_id = a.account_id";
        query += "     LEFT JOIN `ingredients` i ON i.ingredient_id = r.ingredient_id";
        query += "     LEFT JOIN `unit` u ON u.unit_id = r.unit_id";
        query += " ORDER BY r.transaction_date desc";
        db.query(query, (err,results) => {
            if (err) throw err;
            res.send(results);
        });
});

app.get("/microservices/restock", async (req, res) => {
    try {
        const restockResponse = await axios.get("http://localhost:3000/microservices/restock_audit");
        const analyticsResponse = await axios.get("http://localhost:3000/microservices/analytics");
        const ingredientUnit = await axios.get("http://localhost:3000/microservices/ingredient_unit_pair");

        res.send({
            result: analyticsResponse.data,
            restock: restockResponse.data,
            ingredientUnitResult: ingredientUnit.data
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/microservices/discard", async (req, res) => {
    try {
        const discardResponse = await axios.get("http://localhost:3000/microservices/discard_audit");
        const ingredientUnit = await axios.get("http://localhost:3000/microservices/ingredient_unit_pair");
        const maxIngredientsValues = await axios.get("http://localhost:3000/microservices/max_ingredient_values");

        res.send({
            result: discardResponse.data,
            ingredientUnitResult: ingredientUnit.data,
            maxIngredients: maxIngredientsValues.data
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/microservices/analytics", (req, res)=>{
    var	query =	    " SELECT	x.ingredient_id,";
        query +=	" 		x.ingredient_name,";
        query +=	"         json_objectagg(un.unit_name, CONCAT(x.analysis * iuu.multiplier, un.unit_symbol)) AS analysis";
        query +=	" FROM (";
        query +=	"     SELECT  analytics.ingredient_id";
        query +=	"             , i.ingredient_name";
        query +=	"             , GREATEST(ROUND(SUM(analytics.total * analytics.multiplier) / SUM(analytics.multiplier)) - i.amount,0) AS analysis";
        query +=	"     FROM ";
        query +=	"     (";
        query +=	"         SELECT ";
        query +=	"             increaser.ingredient_id";
        query +=	"             , increaser.transaction_date";
        query +=	"             , SUM(increaser.amount / u.multiplier * increaser.`usage`) AS total";
        query +=	"             , power(0.5,datediff(current_date() , date(increaser.transaction_date)) + 1) as multiplier";
        query +=	"             , 1 as unit_id";
        query +=	"         FROM";
        query +=	"         (";
        query +=	"             (";
        query +=	"                 SELECT  ";
        query +=	"                     ingredient_id";
        query +=	"                     , transaction_date";
        query +=	"                     , amount";
        query +=	"                     , unit_id ";
        query +=	"                     , 1 AS `usage`";
        query +=	"                 FROM Missing";
        query +=	"             )";
        query +=	" ";
        query +=	"             UNION ALL";
        query +=	" ";
        query +=	"             (";
        query +=	"                 SELECT  ";
        query +=	"                     ingredient_id";
        query +=	"                     , transaction_date";
        query +=	"                     , amount";
        query +=	"                     , unit_id ";
        query +=	"                     , 1 AS `usage`";
        query +=	"                 FROM Missed_Opportunity";
        query +=	"             )";
        query +=	" ";
        query +=	"             UNION ALL";
        query +=	" ";
        query +=	"             (";
        query +=	"                 SELECT	i.ingredient_id";
        query +=	"                         , o.order_date AS transaction_date";
        query +=	"                         , SUM(ol.amount*mi.amount) AS amount";
        query +=	"                         , mi.unit_id";
        query +=	"                         , 1 as `usage`";
        query +=	"                 FROM `order` o";
        query +=	"                 RIGHT JOIN order_list ol ON o.order_id = ol.order_id";
        query +=	"                 LEFT JOIN menu m ON ol.menu_id = m.menu_id";
        query +=	"                 RIGHT JOIN menu_ingredients mi ON m.menu_id = mi.menu_id";
        query +=	"                 LEFT JOIN ingredients i ON mi.ingredient_id = i.ingredient_id";
        query +=	"                 GROUP BY    o.order_date";
        query +=	"                             , i.ingredient_id";
        query +=	"                             , mi.unit_id";
        query +=	"                 ORDER BY    o.order_date";
        query +=	"                             , i.ingredient_id";
        query +=	"                             , mi.unit_id";
        query +=	"             )";
        query +=	" ";
        query +=	"             UNION ALL";
        query +=	" ";
        query +=	"             (";
        query +=	"                 SELECT  ";
        query +=	"                     ingredient_id";
        query +=	"                     , transaction_date";
        query +=	"                     , amount";
        query +=	"                     , unit_id ";
        query +=	"                     , -1 AS `usage`";
        query +=	"                 FROM Discard";
        query +=	"             )    ";
        query +=	" ";
        query +=	"             ";
        query +=	"         ) increaser";
        query +=	"         LEFT JOIN ingredient_units u ";
        query +=	"         ON ";
        query +=	"             increaser.ingredient_id = u.ingredient_id ";
        query +=	"             AND increaser.unit_id = u.unit_id";
        query +=	"         WHERE transaction_date >= DATE_SUB(CURDATE(),INTERVAL 20 DAY)";
        query +=	"         GROUP BY ingredient_id, transaction_date";
        query +=	"         ORDER BY ingredient_id, transaction_date";
        query +=	"     ) analytics ";
        query +=	"     LEFT JOIN ingredients i ON i.ingredient_id = analytics.ingredient_id";
        query +=	"     GROUP BY analytics.ingredient_id";
        query +=	" ) x ";
        query +=	" INNER JOIN ingredient_units iuu ON iuu.ingredient_id = x.ingredient_id";
        query +=	" LEFT JOIN unit un ON un.unit_id = iuu.unit_id";
        query +=	" WHERE analysis > 0";
        query +=	" GROUP BY ingredient_id";
        db.query(query, (err,results) => {
            if (err) throw err;
            res.send(results);
        });
});

app.get("/", (req,res)=>{
    axios.get("http://localhost:3000/microservices/analytics")
        .then(response =>{
            res.render("dashboard", {result: response.data});
        })
        .catch(err => {
            res.status(500).send({error:err});
        });
});

app.get("/restock", (req,res)=>{
    axios.get("http://localhost:3000/microservices/restock")
        .then(response =>{
            res.render("restock", response.data);
        })
        .catch(err => {
            res.status(500).send({error:err});
        });
});

app.get("/discard", (req,res)=>{
    axios.get("http://localhost:3000/microservices/discard")
        .then(response =>{
            res.render("discard", response.data);
        })
        .catch(err => {
            res.status(500).send({error:err});
        });
});

app.post("/insert_restock", (req,res)=>{
    var query =     "INSERT INTO `restock`(";
        query +=    "    ingredient_id";
        query +=    "    , amount";
        query +=    "    , unit_id";
        query +=    "    , transaction_date";
        query +=    "    , account_id";
        query +=    ") VALUES (";
        query +=    "    '"+req.body.ingredient+"'";
        query +=    "    ,'"+req.body.amount+"'";
        query +=    "    ,'"+req.body.unit+"'";
        query +=    "    , CURDATE()";
        query +=    "    , 1";
        query +=    ")";
    db.query(query, (err,results) => {
        if (err) throw err;
        const referer = req.headers.referer;
        res.redirect(referer);
    });
});

app.post("/insert_discard", (req,res)=>{
    var query =     "INSERT INTO `discard`(";
        query +=    "    ingredient_id";
        query +=    "    , amount";
        query +=    "    , unit_id";
        query +=    "    , transaction_date";
        query +=    "    , account_id";
        query +=    ") VALUES (";
        query +=    "    '"+req.body.ingredient+"'";
        query +=    "    ,'"+req.body.amount+"'";
        query +=    "    ,'"+req.body.unit+"'";
        query +=    "    , CURDATE()";
        query +=    "    , 1";
        query +=    ")";
    db.query(query, (err,results) => {
        if (err) throw err;
        const referer = req.headers.referer;
        res.redirect(referer);
    });
});

app.get('*', (req, res) => {
    res.status(404).send('Page not found');
  });
app.listen(3000, function () {
    console.log("server started on port 3000");
});
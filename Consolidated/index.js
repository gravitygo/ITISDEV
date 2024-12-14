//TODO Discrepancy Report
//TODO periodic filtering

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const mysql = require("mysql2");
const db = require("./databaseCredentials");

const bcrypt = require("bcrypt");
const sessions = require("express-session");

//npm i express body-parser mysql2 axios

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

function accessControl(res, usersession, userrole, roleallowed) {
    if (session === undefined || session.userid === undefined) {
        res.redirect("/");
        return false;
    }
    if (!roleallowed.includes(session.userrole.toLowerCase())) {
        res.render("restrictedaccesserror", { userRole: userrole });
        return false;
    }
    return true;
}
var session;

//sessionstart
const oneDay = 1000 * 60 * 60 * 24;
app.use(
	sessions({
		secret: "thisisitisdevgroup4secrett32223",
		saveUninitialized: true,
		cookie: { maxAge: oneDay },
		resave: false,
	})
);

db.connect(function (err) {
	if (err) throw err;
	console.log("Connected!");
});

app.use(function (req, res, next) {
	res.locals.username = req.session.userid;
	res.locals.userrole = req.session.userrole;
	res.locals.userid = req.session.iduser;
	next();
});

app.get("/microservices/inventory-transaction", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		var query = " SELECT * ";
		query += ", lpad(order_id, 10, 0) AS orderid";
		query += " FROM `order` o";
		query += " LEFT JOIN `account` a ON o.account_id=a.account_id;";

		db.query(query, (err, results) => {
			if (err) throw err;
			res.send(results);
		});
	}
});

app.get("/restrictedaccesserror",(req,res) => {
	res.render("restrictedaccesserror");

})

app.get("/microservices/discrepancy-report", (req, res) => {
	var query = " SELECT i.ingredient_name";
	query += "   , u.unit_name";
	query +=
		"     , CONCAT(d.discrepancy_amount, u.unit_symbol) discrepancy_amount";
	query += "     , CONCAT(d.expected, u.unit_symbol) expected";
	query += "     , CONCAT(d.current, u.unit_symbol) current";
	query += "     , IF(discrepancy_amount < 0, 'SHORTAGE', 'OVERAGE') status";
	query += "     , date";
	query += " FROM discrepancy d";
	query += " LEFT JOIN ingredients i ON d.ingredient_id = i.ingredient_id";
	query += " LEFT JOIN unit u ON u.unit_id = d.current_unit_id;";
	db.query(query, (err, results) => {
		if (err) throw err;
		res.send(results);
	});
});

app.get("/microservices/inventory-transactions", (req, res) => {
	var query = " SELECT *";
	query += " FROM (";
	query += " 	SELECT i.ingredient_name";
	query += " 		, d.amount";
	query += " 		, u.unit_name";
	query += " 		, concat(a.fname, ' ', a.lname) AS full_name";
	query += " 		, 'Restocked' AS `Type` ";
	query += " 		, d.transaction_date";
	query += " 	FROM `restock` d";
	query += " 	LEFT JOIN ingredients i ON i.ingredient_id = d.ingredient_id";
	query += " 	LEFT JOIN unit u ON u.unit_id = d.unit_id";
	query += " 	LEFT JOIN account a ON a.account_id = d.account_id";
	query += "     ";
	query += "     UNION ALL";
	query += "     ";
	query += "     SELECT i.ingredient_name";
	query += " 		, d.amount";
	query += " 		, u.unit_name";
	query += " 		, concat(a.fname, ' ', a.lname)";
	query += " 		, 'Discarded' AS `Type` ";
	query += " 		, d.transaction_date";
	query += " 	FROM `discard` d";
	query += " 	LEFT JOIN ingredients i ON i.ingredient_id = d.ingredient_id";
	query += " 	LEFT JOIN unit u ON u.unit_id = d.unit_id";
	query += " 	LEFT JOIN account a ON a.account_id = d.account_id";
	query += "     ";
	query += "     UNION ALL";
	query += "     ";
	query += "     SELECT i.ingredient_name";
	query += " 		, mi.amount*ol.amount";
	query += " 		, u.unit_name";
	query += " 		, concat(a.fname, ' ', a.lname) ";
	query += " 		, 'Ordered' AS `Type`";
	query += " 		, o.order_date";
	query += " 	FROM `order` o";
	query += " 	LEFT JOIN order_list ol ON ol.order_id=o.order_id";
	query += " 	LEFT JOIN dish_ingredients mi ON ol.dish_id = mi.dish_id";
	query += " 	LEFT JOIN ingredients i ON i.ingredient_id = mi.ingredient_id";
	query += " 	LEFT JOIN unit u ON u.unit_id = mi.unit_id";
	query += " 	LEFT JOIN account a ON a.account_id = o.account_id";
	query += " ) a";
	query += " ORDER BY transaction_date desc";

	db.query(query, (err, results) => {
		if (err) throw err;
		res.send(results);
	});
});

app.get("/microservices/inventory", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		var query = " SELECT";
		query += "     ingredient_id";
		query += "     , ingredient_name";
		query += "     , inventory";
		query += " FROM";
		query += "     (";
		query += "         SELECT";
		query += "             i.ingredient_id,";
		query += "             i.ingredient_name,";
		query += "             json_objectagg(";
		query += "                 u.unit_name,";
		query += "                 concat (amount * iu.multiplier, u.unit_symbol)";
		query += "             ) inventory";
		query += "         FROM";
		query += "             ingredients i";
		query +=
			"             RIGHT JOIN ingredient_units iu ON iu.ingredient_id = i.ingredient_id";
		query += "             LEFT JOIN unit u ON iu.unit_id = u.unit_id";
		query += "         GROUP BY";
		query += "             i.ingredient_id";
		query += "     ) x;";
		db.query(query, (err, results) => {
			if (err) throw err;
			res.send(results);
		});
	}
});

app.get("/microservices/orders", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "chef"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		var query = " SELECT * ";
		query += ", lpad(order_id, 10, 0) AS orderid";
		query += " FROM `order` o";
		query += " LEFT JOIN `account` a ON o.account_id=a.account_id;";

		db.query(query, (err, results) => {
			if (err) throw err;
			res.send(results);
		});
	}
});

app.get("/microservices/check-inventory", (req, res) => {
	var query = " SELECT ";
	query += " 	iu.ingredient_id ingredientID,";
	query += "     i.ingredient_name ingredientName,";
	query += "     json_objectagg(u.unit_name, iu.multiplier) unitMultiplier";
	query += " FROM ";
	query += " ingredient_units iu";
	query += " LEFT JOIN ingredients i ON i.ingredient_id = iu.ingredient_id";
	query += " LEFT JOIN unit u ON iu.unit_id = u.unit_id";
	query += " GROUP BY iu.ingredient_id;";

	db.query(query, (err, results) => {
		if (err) throw err;
		res.send(results);
	});
});

app.get("/microservices/ingredient-unit-amount", (req, res) => {
	var query = " SELECT";
	query += " 	json_objectagg(";
	query += " 		i.ingredient_id,";
	query += " 		json_merge(";
	query += " 			json_object('ingredientAmount', i.amount),";
	query += " 			json_object('units', x.units)";
	query += " 		)";
	query += "     ) jsonData";
	query += " FROM";
	query += "     ingredients i";
	query += "     LEFT JOIN (";
	query += "         SELECT";
	query += "             iu.ingredient_id,";
	query += "             json_objectagg(iu.unit_id, iu.multiplier) units";
	query += "         FROM";
	query += "             ingredient_units iu";
	query += "         GROUP BY";
	query += "             ingredient_id";
	query += "     ) x ON i.ingredient_id = x.ingredient_id;";

	db.query(query, (err, results) => {
		if (err) throw err;
		res.send(results);
	});
});

app.get("/microservices/menu-ingredient-unit", (req, res) => {
	var query = " SELECT";
	query += " 	json_objectagg(";
	query += " 		m.dish_id,";
	query += " 		json_merge(";
	query += " 			json_object('dishName', m.dish_name),";
	query += " 			json_object('price', m.price),";
	query += " 			json_object('ingredients', mi.ingredients)";
	query += " 		)";
	query += "     ) jsonData";
	query += " FROM";
	query += "     dish m";
	query += "     RIGHT JOIN (";
	query += "         SELECT";
	query += "             dish_id,";
	query += "             json_objectagg(";
	query += "                 x.ingredient_id,";
	query += "                 json_merge(";
	query += "                     json_object ('unit', x.unit_id),";
	query += "                     json_object ('amount', x.amount)";
	query += "                 )";
	query += "             ) ingredients";
	query += "         FROM";
	query += "             dish_ingredients x";
	query += "         GROUP BY";
	query += "             x.dish_id";
	query += "     ) mi ON m.dish_id = mi.dish_id";
	query += " WHERE";
	query += "     m.is_disabled = 0";
	query += "     AND m.status = 'Approved';";

	db.query(query, (err, results) => {
		if (err) throw err;
		res.send(results);
	});
});

app.get("/microservices/pos", async (req, res) => {
	try {
		const ingredientUnitsAmount = await axios.get(
			"http://localhost:3000/microservices/ingredient-unit-amount"
		);
		const menuIngredients = await axios.get(
			"http://localhost:3000/microservices/menu-ingredient-unit"
		);

		res.send({
			ingredientUnitsAmount: ingredientUnitsAmount.data[0],
			menuIngredients: menuIngredients.data[0],
		});
	} catch (err) {
		res.status(500).send({ error: err.message });
	}
});

app.get("/microservices/orders/:orderid", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "chef"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		let orderid = req.params.orderid;
		var query = " SELECT ";
		query += " 	ol.* ";
		query += "     , m.dish_name";
		query += " FROM order_list ol";
		query += " LEFT JOIN dish m ON ol.dish_id = m.dish_id";
		query += " WHERE order_id= " + orderid + ";";

		db.query(query, (err, results) => {
			if (err) throw err;
			res.send(results);
		});
	}
});

app.get("/microservices/max_ingredient_values", (req, res) => {
	if (session == null) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		var query = " SELECT json_objectagg(ingredient_id, maxVals) as maxVals";
		query += " FROM (";
		query += " 	SELECT ";
		query += " 		i.ingredient_id AS ingredient_id";
		query += " 		, json_objectagg(iu.unit_id, (i.amount * iu.multiplier)) maxVals";
		query += " 	FROM ingredients i";
		query += " 	RIGHT JOIN ingredient_units iu";
		query += " 	ON i.ingredient_id = iu.ingredient_id";
		query += " 	GROUP BY i.ingredient_id";
		query += " ) x;";

		db.query(query, (err, results) => {
			if (err) throw err;
			res.send(results);
		});
	}
});

app.get("/microservices/ingredient_unit_pair", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		var query = " SELECT json_objectagg(ingredient_id, json_data) AS data";
		query += " FROM";
		query += " (SELECT";
		query += " 	i.ingredient_id,";
		query += "     json_merge(";
		query += " 	json_object('ingredientName', i.ingredient_name),";
		query += "     json_object('units',";
		query += " 			json_objectagg(";
		query += " 				u.unit_id,";
		query += " 				CONCAT (unit_name, ' (', unit_symbol, ')')";
		query += " 			)";
		query += " 	)) as json_data";
		query += " FROM";
		query += "     ingredient_units iu";
		query += "     LEFT JOIN ingredients i ON i.ingredient_id = iu.ingredient_id";
		query += "     LEFT JOIN unit u ON u.unit_id = iu.unit_id";
		query += " GROUP BY";
		query += "     i.ingredient_id";
		query += " ) x";

		db.query(query, (err, results) => {
			if (err) throw err;
			res.send(results);
		});
	}
});

app.post("/microservices/inventory-discrepancy", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		const jsonData = req.body.jsonData;

		// Parse the JSON string back into an array of objects
		const dataArray = JSON.parse(decodeURIComponent(jsonData));
		dataArray.forEach((element) => {
			var query = " INSERT INTO discrepancy(";
			query += " 	ingredient_id";
			query += " 	, current";
			query += " ) VALUES (" + element.ingredient + ", " + element.amount + ");";

			db.query(query, (err, results) => {
				if (err) console.log("No discrepancy");
			});
		});
		res.redirect("/inventory-check");
	}
});

app.post("/microservices/pos-order-miss", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "cashier"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		const orderData = req.body.orderData;
		const missOpportunityData = req.body.missOpportunityData;

		// Parse the JSON string back into an array of objects
		const orderDataArray = JSON.parse(decodeURIComponent(orderData));
		const missOpportunityDataArray = JSON.parse(
			decodeURIComponent(missOpportunityData)
		);
		var orderID = 0;
		var query = " INSERT INTO `order`(";
		query += " 		order_date";
		query += "     , account_id";
		query += " )VALUES(";
		query += " 		NOW()";
		query += "     , " + session.iduser;
		query += " );";
		db.query(query, (err, results) => {
			if (err) throw err;

			orderID = results.insertId;
			Object.keys(orderDataArray).forEach((item) => {
				query = " INSERT INTO `order_list` VALUES(";
				query += " 		" + orderID;
				query += "     , " + item;
				query += "     , " + orderDataArray[item];
				query += " );";
				db.query(query, (err, results) => {
					if (err) throw err;
					query = " SELECT";
					query += "     di.ingredient_id,";
					query += "     SUM(di.amount * iu.multiplier * ol.amount) amount";
					query += " FROM";
					query += "     order_list ol";
					query += "     LEFT JOIN dish_ingredients di ON di.dish_id = ol.dish_id";
					query += "     LEFT JOIN ingredient_units iu ON di.unit_id = iu.unit_id";
					query += "     AND di.ingredient_id = iu.ingredient_id";
					query += " WHERE";
					query += "     ol.order_id = " + orderID;
					query += " GROUP BY";
					query += "     ingredient_id;";

					db.query(query, (err, select) => {
						if (err) throw err;
						else{
							select.forEach((item) => {
								query = "UPDATE ingredients SET amount = amount - " + item.amount + " WHERE ingredient_id = " + item.ingredient_id +";";
								db.query(query, (err, select) => {
									if (err) console.log(err);
								});
							});
						}
					});
				});
			});
		});
		Object.keys(missOpportunityDataArray).forEach((item)=>{
			Object.keys(missOpportunityDataArray[item]).forEach((units)=>{
				query = " INSERT INTO missed_opportunity (";
				query += "         ingredient_id";
				query += "         , unit_id";
				query += "         , amount";
				query += "         , transaction_date";
				query += "     )";
				query += " VALUES(";
				query += "     " + item;
				query += "     , " + units;
				query += "     , " + missOpportunityDataArray[item][units];
				query += "     , NOW ()";
				query += " );";
				db.query(query, (err, select) => {
					if (err) console.log(err);
				});
			})
		})
		res.redirect("/POS");
	}
});

app.get("/microservices/restock_audit", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		var query = " SELECT";
		query += "     i.ingredient_name AS 'Ingredient',";
		query += "     u.unit_name AS 'Unit',";
		query += "     CONCAT (r.amount, u.unit_symbol) AS 'Restock Count',";
		query += "     CONCAT (fname, ' ', lname) AS 'User',";
		query += "     DATE(r.transaction_date)";
		query += " FROM";
		query += "     `restock` r";
		query += "     LEFT JOIN `account` a ON r.account_id = a.account_id";
		query +=
			"     LEFT JOIN `ingredients` i ON i.ingredient_id = r.ingredient_id";
		query += "     LEFT JOIN `unit` u ON u.unit_id = r.unit_id";
		query += " ORDER BY r.transaction_date desc";
		db.query(query, (err, results) => {
			if (err) throw err;
			res.send(results);
		});
	}
});

app.get("/microservices/missed-opportunity", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		var query = " SELECT";
		query += "     i.ingredient_name AS 'Ingredient',";
		query += "     u.unit_name AS 'Unit',";
		query += "     CONCAT (r.amount, u.unit_symbol) AS 'Amount',";
		query += "     DATE(r.transaction_date)";
		query += " FROM";
		query += "     `missed_opportunity` r";
		query +=
			"     LEFT JOIN `ingredients` i ON i.ingredient_id = r.ingredient_id";
		query += "     LEFT JOIN `unit` u ON u.unit_id = r.unit_id";
		query += " ORDER BY r.transaction_date desc";
		db.query(query, (err, results) => {
			if (err) throw err;
			res.send(results);
		});
	}
});
app.get("/microservices/discard_audit", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		var query = " SELECT";
		query += "     i.ingredient_name AS 'Ingredient',";
		query += "     u.unit_name AS 'Unit',";
		query += "     CONCAT (r.amount, u.unit_symbol) AS 'Restock Count',";
		query += "     CONCAT (fname, ' ', lname) AS 'User',";
		query += "     DATE(r.transaction_date)";
		query += " FROM";
		query += "     `discard` r";
		query += "     LEFT JOIN `account` a ON r.account_id = a.account_id";
		query +=
			"     LEFT JOIN `ingredients` i ON i.ingredient_id = r.ingredient_id";
		query += "     LEFT JOIN `unit` u ON u.unit_id = r.unit_id";
		query += " ORDER BY r.transaction_date desc";
		db.query(query, (err, results) => {
			if (err) throw err;
			res.send(results);
		});
	}
});

app.get("/microservices/restock", async (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		try {
			const restockResponse = await axios.get(
				"http://localhost:3000/microservices/restock_audit"
			);
			const analyticsResponse = await axios.get(
				"http://localhost:3000/microservices/analytics"
			);
			const ingredientUnit = await axios.get(
				"http://localhost:3000/microservices/ingredient_unit_pair"
			);

			res.send({
				result: analyticsResponse.data,
				restock: restockResponse.data,
				ingredientUnitResult: ingredientUnit.data,
			});
		} catch (err) {
			res.status(500).send({ error: err.message });
		}
	}
});

app.get("/microservices/discard", async (req, res) => {
		if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		try {
			const discardResponse = await axios.get(
				"http://localhost:3000/microservices/discard_audit"
			);
			const ingredientUnit = await axios.get(
				"http://localhost:3000/microservices/ingredient_unit_pair"
			);
			const maxIngredientsValues = await axios.get(
				"http://localhost:3000/microservices/max_ingredient_values"
			);

			res.send({
				result: discardResponse.data,
				ingredientUnitResult: ingredientUnit.data,
				maxIngredients: maxIngredientsValues.data,
			});
		} catch (err) {
			res.status(500).send({ error: err.message });
		}
	}
});

app.get("/microservices/analytics", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		var query = " SELECT	x.ingredient_id,";
		query += " 		x.ingredient_name,";
		query +=
			"         json_objectagg(un.unit_name, CONCAT(x.analysis * iuu.multiplier, un.unit_symbol)) AS analysis";
		query += " FROM (";
		query += "     SELECT  analytics.ingredient_id";
		query += "             , i.ingredient_name";
		query +=
			"             , GREATEST(ROUND(SUM(analytics.total * analytics.multiplier) / SUM(analytics.multiplier)) - i.amount,0) AS analysis";
		query += "     FROM ";
		query += "     (";
		query += "         SELECT ";
		query += "             increaser.ingredient_id";
		query += "             , increaser.transaction_date";
		query +=
			"             , SUM(increaser.amount / u.multiplier * increaser.`usage`) AS total";
		query +=
			"             , power(0.5,datediff(current_date() , date(increaser.transaction_date)) + 1) as multiplier";
		query += "             , 1 as unit_id";
		query += "         FROM";
		query += "         (";
		query += " ";
		query += "             (";
		query += "                 SELECT  ";
		query += "                     ingredient_id";
		query += "                     , transaction_date";
		query += "                     , amount";
		query += "                     , unit_id ";
		query += "                     , 1 AS `usage`";
		query += "                 FROM Missed_Opportunity";
		query += "             )";
		query += " ";
		query += "             UNION ALL";
		query += "             (";
		query += "                 SELECT  ";
		query += "                     ingredient_id";
		query += "                     , date";
		query += "                     , discrepancy_amount";
		query += "                     , current_unit_id ";
		query += "                     , 1 AS `usage`";
		query += "                 FROM discrepancy";
		query += "             )";
		query += " ";
		query += "             UNION ALL";

		query += " ";
		query += "             (";
		query += "                 SELECT	i.ingredient_id";
		query += "                         , o.order_date AS transaction_date";
		query += "                         , SUM(ol.amount*mi.amount) AS amount";
		query += "                         , mi.unit_id";
		query += "                         , 1 as `usage`";
		query += "                 FROM `order` o";
		query +=
			"                 RIGHT JOIN order_list ol ON o.order_id = ol.order_id";
		query += "                 LEFT JOIN dish m ON ol.dish_id = m.dish_id";
		query +=
			"                 RIGHT JOIN dish_ingredients mi ON m.dish_id = mi.dish_id";
		query +=
			"                 LEFT JOIN ingredients i ON mi.ingredient_id = i.ingredient_id";
		query += "                 GROUP BY    o.order_date";
		query += "                             , i.ingredient_id";
		query += "                             , mi.unit_id";
		query += "                 ORDER BY    o.order_date";
		query += "                             , i.ingredient_id";
		query += "                             , mi.unit_id";
		query += "             )";
		query += " ";
		query += "             UNION ALL";
		query += " ";
		query += "             (";
		query += "                 SELECT  ";
		query += "                     ingredient_id";
		query += "                     , transaction_date";
		query += "                     , amount";
		query += "                     , unit_id ";
		query += "                     , -1 AS `usage`";
		query += "                 FROM Discard";
		query += "             )    ";
		query += " ";
		query += "             ";
		query += "         ) increaser";
		query += "         LEFT JOIN ingredient_units u ";
		query += "         ON ";
		query += "             increaser.ingredient_id = u.ingredient_id ";
		query += "             AND increaser.unit_id = u.unit_id";
		query +=
			"         WHERE transaction_date >= DATE_SUB(CURDATE(),INTERVAL 20 DAY)";
		query += "         GROUP BY ingredient_id, transaction_date";
		query += "         ORDER BY ingredient_id, transaction_date";
		query += "     ) analytics ";
		query +=
			"     LEFT JOIN ingredients i ON i.ingredient_id = analytics.ingredient_id";
		query += "     GROUP BY analytics.ingredient_id";
		query += " ) x ";
		query +=
			" INNER JOIN ingredient_units iuu ON iuu.ingredient_id = x.ingredient_id";
		query += " LEFT JOIN unit un ON un.unit_id = iuu.unit_id";
		query += " WHERE analysis > 0";
		query += " GROUP BY ingredient_id";
		db.query(query, (err, results) => {
			if (err) throw err;
			res.send(results);
		});
	}
});

app.get("/inventory-transactions", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		axios
			.get("http://localhost:3000/microservices/inventory-transactions")
			.then((response) => {
				res.render("inventorytransaction", { result: response.data });
			})
			.catch((err) => {
				res.status(500).send({ error: err });
			});
	}
});

app.get("/discrepancy-report", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		axios
			.get("http://localhost:3000/microservices/discrepancy-report")
			.then((response) => {
				res.render("discrepancy", { result: response.data });
			})
			.catch((err) => {
				res.status(500).send({ error: err });
			});
	}
});

app.get("/inventory", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		axios
			.get("http://localhost:3000/microservices/inventory")
			.then((response) => {
				res.render("inventory", { result: response.data });
			})
			.catch((err) => {
				res.status(500).send({ error: err });
			});
	}
});

app.get("/orders", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "chef"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		axios
			.get("http://localhost:3000/microservices/orders")
			.then((response) => {
				res.render("orders", { result: response.data });
			})
			.catch((err) => {
				res.status(500).send({ error: err });
			});
	}
});

app.get("/inventory-check", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		axios
			.get("http://localhost:3000/microservices/check-inventory")
			.then((response) => {
				res.render("inventorycheck", { result: response.data });
			})
			.catch((err) => {
				res.status(500).send({ error: err });
			});
	}
});

app.get("/missed-opportunity", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		axios
			.get("http://localhost:3000/microservices/missed-opportunity")
			.then((response) => {
				res.render("missedopportunity", { result: response.data });
			})
			.catch((err) => {
				res.status(500).send({ error: err });
			});
	}
});

app.get("/", (req, res) => {
	session = req.session;
	if (session.userid) {
		if (session.userrole == "cashier") {
			res.redirect("pos");
		}
		if (session.userrole == "admin" || session.userrole == "stock controller") {
			res.redirect("dashboard");
		}
		if (session.userrole == "chef") {
			res.redirect("dish");
		}
	} else res.render("login", { message: "" });
});

app.get("/login", (req, res) => {
	req.session.destroy((err) => {
		res.redirect("/"); // will always fire after session is destroyed
	});
});
app.get("/register", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin"];
		if(accessControl(res, session.userid, session.userrole, roleallowed)) res.render("register", { message: "" });
	
	}
});

app.get("/disableuser/:username", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin"];
		accessControl(res, session.userid, session.userrole, roleallowed);

		const username = '"' + req.params.username + '"';
		var currentUser = username;
		var usernamequery = "SELECT * FROM account WHERE username =" + currentUser;
		db.query(usernamequery, (err, rows) => {
			res.render("disableuser", { message: "", rows: rows });
		});
	}
});

app.get("/activateuser/:username", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin"];
		accessControl(res, session.userid, session.userrole, roleallowed);

		const username = '"' + req.params.username + '"';
		var currentUser = username;
		var usernamequery = "SELECT * FROM account WHERE username =" + currentUser;
		db.query(usernamequery, (err, rows) => {
			res.render("activate", { message: "", rows: rows });
		});
	}
});

app.get("/edituser/:username", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		const username = '"' + req.params.username + '"';
		var currentUser = username;
		var usernamequery = "SELECT * FROM account WHERE username =" + currentUser;
		let query = db.query(usernamequery, (err, rows) => {
			res.render("edituser", {
				message: "",
				rows: rows,
				currentUserEdit: currentUser,
			});
		});
	}
});
app.get("/userlist", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin"];
		accessControl(res, session.userid, session.userrole, roleallowed);

		let thisIsMyQueryForUsers = `
      SELECT
        *
        FROM
        account
        ORDER BY is_disabled asc
        `;
		let query = db.query(thisIsMyQueryForUsers, (err, results) => {
			res.render("userlist", {
				results: results,
			});
		});
	}
});

app.get("/dashboard", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		axios
			.get("http://localhost:3000/microservices/analytics")
			.then((response) => {
				res.render("dashboard", { result: response.data });
			})
			.catch((err) => {
				res.status(500).send({ error: err });
			});
	}
});
app.get("/pos", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "cashier"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		axios
			.get("http://localhost:3000/microservices/pos")
			.then((response) => {
				res.render("pos", { result: response.data });
			})
			.catch((err) => {
				res.status(500).send({ error: err });
			});
	}
});

app.get("/restock", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		axios
			.get("http://localhost:3000/microservices/restock")
			.then((response) => {
				res.render("restock", response.data);
			})
			.catch((err) => {
				res.status(500).send({ error: err });
			});
	}
});

app.get("/discard", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		axios
			.get("http://localhost:3000/microservices/discard")
			.then((response) => {
				res.render("discard", response.data);
			})
			.catch((err) => {
				res.status(500).send({ error: err });
			});
	}
});

app.post("/insert_restock", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		accessControl(res, session.userid, session.userrole, roleallowed);
		var query = "INSERT INTO `restock`(";
		query += "    ingredient_id";
		query += "    , amount";
		query += "    , unit_id";
		query += "    , transaction_date";
		query += "    , account_id";
		query += ") VALUES (";
		query += "    '" + req.body.ingredient + "'";
		query += "    ,'" + req.body.amount + "'";
		query += "    ,'" + req.body.unit + "'";
		query += "    , CURDATE()";
		query += "    , " + session.iduser;
		query += ")";
		db.query(query, (err, results) => {
			if (err) throw err;
			res.redirect("/restock");
		});
	}
});

app.post("/insert_discard", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else {
		const roleallowed = ["admin", "stock controller"];
		var query = "INSERT INTO `discard`(";
		query += "    ingredient_id";
		query += "    , amount";
		query += "    , unit_id";
		query += "    , transaction_date";
		query += "    , account_id";
		query += ") VALUES (";
		query += "    '" + req.body.ingredient + "'";
		query += "    ,'" + req.body.amount + "'";
		query += "    ,'" + req.body.unit + "'";
		query += "    , CURDATE()";
		query += "    , " + session.iduser;
		query += ")";
		db.query(query, (err, results) => {
			if (err) throw err;
			res.redirect("/discard");
		});
	}
});
//START- login
app.post("/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	const query = "SELECT * FROM account WHERE username = ? AND is_disabled = 0";
	db.query(query, [username], function (err, results) {
		if (err) throw err;

		if (results.length > 0) {
			const storedPassword = results[0].password;
			bcrypt.compare(password, storedPassword, function (err, match) {
				if (err) throw err;

				if (match) {
					// Passwords match, proceed with login
					session = req.session;
					session.userid = req.body.username;
					session.iduser = results[0].account_id;
					session.userrole = results[0].role;
					if (results[0].change_password == 1) {
						res.redirect("/");
					} else {
						res.render("createpassword", {
							message: "",
							username: username,
						});
					}
				} else {
					// Passwords don't match
					res.render("login", {
						message: "Invalid username or password. Please try again.",
						username: username,
					});
				}
			});
		} else {
			// Username doesn't exist in the account table
			res.render("login", {
				message: "Invalid username or password. Please try again.",
				username: username,
			});
		}
	});
});
//END- login
//START- new user create password
app.post("/newusercreatepassword", (req, res) => {
	const { username, password, confirmPassword } = req.body;

	//checks if password is appropriate length and if password is same as confirm password
	if (
		password !== confirmPassword ||
		password.length < 8 ||
		confirmPassword.length < 8
	) {
		return res.render("createpassword", {
			message:
				"Passwords do not match or are less than 8 characters. Please re-enter the passwords.",
			username: username,
		});
	}

	// Encrypt the password
	bcrypt.hash(password, 10, function (err, hashedPassword) {
		if (err) {
			console.log("Error hashing password:", err);
			return res.render("createpassword", {
				message:
					"An error occurred while creating the user. Please try again later.",
				username: username,
			});
		}
		const newUser = {
			password: hashedPassword,
		};
		db.query(
			"UPDATE account SET change_password = 1, password = ? WHERE username = ?",
			[newUser.password, username],
			(err, result) => {
				if (err) {
					console.log("Error inserting user data:", err);
					return res.render("createpassword", {
						message:
							"An error occurred while creating the user. Please try again later.",
						username: username,
					});
				}

				// User creation successful, redirect to a success page or appropriate route
				res.redirect("/");
			}
		);
	});
});
//END- new user create password
//START- disable user
app.post("/disable-user", (req, res) => {
	const username = req.body.username;
	var disableQuery = "UPDATE account SET is_disabled = 1 WHERE username = ?";
	db.query(disableQuery, [username], (err) => {
		if (err) {
			// handle the error
		} else {
			res.redirect("userlist");
		}
	});
});
//END- disable user

//START- activate user
app.post("/activate-user", (req, res) => {
	const username = req.body.username;
	var disableQuery = "UPDATE account SET is_disabled = 0 WHERE username = ?";
	db.query(disableQuery, [username], (err) => {
		if (err) {
			// handle the error
		} else {
			res.redirect("userlist");
		}
	});
});
//END- activate user

//START- edit user
app.post("/edit-user", (req, res) => {
	const { firstName, lastName, role, username, password, confirmPassword } =
		req.body;
	var currentUser = req.body.currentUser;
	currentUser = currentUser.replace(/['"]+/g, "");
	let usernamecheck = 0;
	const usernamequery = "SELECT * FROM account WHERE username = ?";
	//Checks if username/username already exists
	db.query(usernamequery, [username], function (err, results) {
		if (err) throw err;

		if (results.length > 0) {
			// Username exists in the account table
			if (results[0].username === currentUser) {
				usernamecheck = 1;
			} else
				return res.render("edituser", {
					message: "Username is taken, please enter a different username",
					fnameEdit: req.body.firstName,
					lnameEdit: req.body.lastName,
					unameEdit: req.body.username,
					roleEdit: req.body.role,
					currentUserEdit: currentUser,
				});
		} else {
			usernamecheck = 1;
		}
	});

	//checks if password is appropriate length and if password is same as confirm password
	if (
		password !== confirmPassword ||
		password.length < 8 ||
		confirmPassword.length < 8
	) {
		if (password == "" && confirmPassword == "") {
		} else {
			return res.render("edituser", {
				message:
					"Passwords do not match or are less than 8 characters. Please re-enter the passwords.",
				fnameEdit: req.body.firstName,
				lnameEdit: req.body.lastName,
				unameEdit: req.body.username,
				roleEdit: req.body.role,
				currentUserEdit: currentUser,
			});
		}
	}
	const newUser = {
		firstName,
		lastName,
		role,
		username,
	};
	if (password.length === 0) {
		db.query(
			"UPDATE account SET fname = ?, lname = ?, role = ?, username = ? WHERE username = ?",
			[
				newUser.firstName,
				newUser.lastName,
				newUser.role,
				newUser.username,
				currentUser,
			],
			(err, result) => {
				if (err) {
					console.log("Error inserting user data:", err);
					return res.render("edituser", {
						message:
							"An error occurred while creating the user. Please try again later.",
					});
				}
				// User creation successful, redirect to a success page or appropriate route
				res.redirect("/userlist");
			}
		);
	} else {
		// Encrypt the password
		bcrypt.hash(password, 10, function (err, hashedPassword) {
			if (err) {
				console.log("Error hashing password:", err);
				return res.render("edituser", {
					message:
						"An error occurred while creating the user. Please try again later.",
					fnameEdit: req.body.firstName,
					lnameEdit: req.body.lastName,
					unameEdit: req.body.username,
					roleEdit: req.body.role,
					currentUserEdit: currentUser,
				});
			}

			// Update the account table
			const newUser = {
				firstName,
				lastName,
				role,
				username,
				password: hashedPassword,
			};

			if (usernamecheck === 1) {
				db.query(
					"UPDATE account SET fname = ?, lname = ?, password = ?, role = ?, username = ? WHERE username = ?",
					[
						newUser.firstName,
						newUser.lastName,
						newUser.password,
						newUser.role,
						newUser.username,
						currentUser,
					],
					(err, result) => {
						if (err) {
							console.log("Error inserting user data:", err);
							return res.render("edituser", {
								message:
									"An error occurred while creating the user. Please try again later.",
							});
						}
						// User creation successful, redirect to a success page or appropriate route
						res.redirect("/userlist");
					}
				);
			}
		});
	}
});
//END- edit user
//START- create user
app.post("/create-user", (req, res) => {
	const { firstName, lastName, role, username, password, confirmPassword } =
		req.body;
	let usernamecheck = 0;

	const usernamequery = "SELECT * FROM account WHERE username = ?";
	//Checks if username/username already exists
	db.query(usernamequery, [username], function (err, results) {
		if (err) throw err;

		if (results.length > 0) {
			// Username exists in the account table
			return res.render("register", {
				message: "Invalid username or password. Please try again.",
				fname: req.body.firstName,
				lname: req.body.lastName,
				uname: req.body.username,
				roler: req.body.role,
			});
		} else {
			usernamecheck = 1;
		}
	});

	//checks if password is appropriate length and if password is same as confirm password
	if (
		password !== confirmPassword ||
		password.length < 8 ||
		confirmPassword.length < 8
	) {
		return res.render("register", {
			message:
				"Passwords do not match or are less than 8 characters. Please re-enter the passwords.",
			fname: req.body.firstName,
			lname: req.body.lastName,
			uname: req.body.username,
			roler: req.body.role,
		});
	}

	// Encrypt the password
	bcrypt.hash(password, 10, function (err, hashedPassword) {
		if (err) {
			console.log("Error hashing password:", err);
			return res.render("register", {
				message:
					"An error occurred while creating the user. Please try again later.",
				fname: req.body.firstName,
				lname: req.body.lastName,
				uname: req.body.username,
				roler: req.body.role,
			});
		}

		// Insert user data into the account table
		const newUser = {
			firstName,
			lastName,
			role,
			username,
			password: hashedPassword,
			isDisabled: 0,
		};

		if (usernamecheck === 1) {
			db.query(
				"INSERT INTO `itisdev_db`.`account` (`fname`, `lname`, `password`, `role`, `username`, `is_disabled`, `change_password`) VALUES (?, ?, ?, ?, ?, 0, 0)",
				[
					newUser.firstName,
					newUser.lastName,
					newUser.password,
					newUser.role,
					newUser.username,
				],
				(err, result) => {
					if (err) {
						console.log("Error inserting user data:", err);
						return res.render("register", {
							message:
								"An error occurred while creating the user. Please try again later.",
						});
					}

					// User creation successful, redirect to a success page or appropriate route
					res.redirect("/userlist");
				}
			);
		}
	});
});

app.post("/checkout", (req, res) => {
	const itemNames = JSON.parse(req.body.itemNames);
	const quantities = JSON.parse(req.body.quantities);
	const itemIDs = JSON.parse(req.body.itemIDs);
	const ingredientsUsed = JSON.parse(req.body.ingredientsUsed);
	const missedOpportunities = JSON.parse(req.body.missedOpportunities);

	// order table
	const orderCountQuery = "SELECT COUNT(*) AS rowCount FROM `order`";
	db.query(orderCountQuery, (err, orderCountResults) => {
		if (err) {
			console.error("Error retrieving row count", err);
			return;
		}
		const order_id = orderCountResults[0].rowCount + 1;
		const currentDate = new Date();
		const order_date = currentDate.toISOString().split("T")[0];

		// inserts the order in the DB
		db.query(
			"INSERT INTO `itisdev_db`.`order`(`order_id`, `order_date`, `account_id`) VALUES (?, ?, 4)",
			[order_id, order_date],
			(err, result) => {
				if (err) {
					console.log("Error inserting order", err);
				}
			}
		);

		// inserts the order list in the DB
		for (let i = 0; i < itemNames.length; i++) {
			db.query(
				"INSERT INTO `itisdev_db`.`order_list`(`order_id`, `dish_id`, `amount`) VALUES (?, ?, ?)",
				[order_id, itemIDs[i], quantities[i]],
				(err, result) => {
					if (err) {
						console.log("Error inserting order_list", err);
					}
				}
			);
		}
	});

	const missedOpportunityCountQuery =
		"SELECT COUNT(*) AS rowCount FROM `missed_opportunity`";
	db.query(
		missedOpportunityCountQuery,
		(err, missedOpportunityCountResults) => {
			if (err) {
				console.error("Error retrieving row count", err);
				return;
			}
			const missed_opportunity_id =
				missedOpportunityCountResults[0].rowCount + 1;
			const currentDate = new Date();
			const transaction_date = currentDate.toISOString().split("T")[0];

			// inserts the missed opportunities
			for (let i = 0; i < missedOpportunities.length; i++) {
				db.query(
					"INSERT INTO `itisdev_db`.`missed_opportunity`(`missed_opportunity_id`, `ingredient_id`, `amount`, `unit_id`, `transaction_date`) VALUES (?, ?, ?, ?, ?)",
					[
						missed_opportunity_id,
						missedOpportunities[i].ingredientid,
						missedOpportunities[i].amount,
						missedOpportunities[i].unitid,
						transaction_date,
					],
					(err, result) => {
						if (err) {
							console.log("Error inserting missed_opportunity", err);
						}
					}
				);
			}
		}
	);

	// updates the ingredients table in the DB
	for (let i = 0; i < ingredientsUsed.length; i++) {
		db.query(
			"UPDATE `itisdev_db`.`ingredients` SET `amount` = ? WHERE `ingredient_id` = ?",
			[ingredientsUsed[i].amount, ingredientsUsed[i].ingredientid],
			(err, result) => {
				if (err) {
					console.log("Error updating ingredients", err);
				}
			}
		);
	}

	res.redirect("pos");
});
//ash and denzel work

//Display Dish (dish.ejs)
app.get("/dish", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else{
	const roleallowed = ["admin", "chef"];
	accessControl(res, session.userid, session.userrole, roleallowed);
	let sql_dish = `
	SELECT * FROM dish 
	WHERE is_disabled = '0'
	AND price != '0';
	`;
	let query_dish = db.query(sql_dish, (err, dish) => {
		res.render("dish", {
			dish: dish,
		});
	});
}
});

//Disable Dish (dish.ejs)
app.get("/dish_disable/:Id", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else{
	const roleallowed = ["admin"];
	accessControl(res, session.userid, session.userrole, roleallowed);
	const ID = req.params.Id;

	let dish_disabled = `
	UPDATE dish SET is_disabled = '1' WHERE dish.dish_id = ${ID}
	`;

	let disable = db.query(dish_disabled, (err, dish) => {
		let sql_dish = `
	  SELECT * FROM dish WHERE is_disabled = '0'
	  `;

		let query_dish = db.query(sql_dish, (err, dish) => {
			res.render("dish", {
				dish: dish,
			});
		});
	});
}
});

app.post("/dish_status/:Id", (req, res) => {
	const roleallowed = ["admin"];
	accessControl(res, session.userid, session.userrole, roleallowed);
	const ID = req.params.Id;
	new_status = req.body.input3;
	dish_name = req.body.dish_name_status;

	let sql_dishstatus = `
	UPDATE dish SET status = '${new_status}' WHERE dish.dish_id = ${ID}
	`;

	let sql_dishdupe = `
	SELECT COUNT(dish_name) FROM dish WHERE dish.dish_name = '${dish_name}' AND dish.status = 'Approved' AND dish.is_disabled = '0';
	`;

	let sql_dishdupeid = `
	SELECT MIN(dish_id) FROM dish WHERE dish.dish_name = '${dish_name}' AND dish.status = 'Approved' AND dish.is_disabled = '0';
	`;

	let dishdupe = db.query(sql_dishdupe, (err, result) => {
		if (result[0]["COUNT(dish_name)"] == 1 && new_status == "Approved") {
			let dishdupeid = db.query(sql_dishdupeid, (err, resultid) => {
				let dish_disabled = `
				UPDATE dish SET is_disabled = '1' WHERE dish.dish_id = ${resultid[0]["MIN(dish_id)"]};
				`;

				let dishdisable = db.query(dish_disabled, (err, resultdisable) => {});
			});
		}
	});

	let dishstatus = db.query(sql_dishstatus, (err, dstatus) => {
		res.redirect("/dish");
	});
});


app.get("/dish_update/:Id", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else{
    const roleallowed = ["admin", "chef"];
    accessControl(res, session.userid, session.userrole, roleallowed);
    const ID = req.params.Id;

    let sql_checkDish = `
        SELECT *
        FROM dish
        WHERE dish_id = '${ID}';
    `;

    let checkDish = db.query(sql_checkDish, (err, checkD) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching dish details.");
        }

        let sql_update_dish = `
            INSERT INTO dish(dish_name, is_disabled, price, status)
            VALUES ('${checkD[0].dish_name}', 0, '${checkD[0].price}', 'Incomplete');
        `;

        db.query(sql_update_dish, (err, update) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error inserting dish.");
            }

            // Get the ID of the newly inserted dish using LAST_INSERT_ID() in a query
            let sql_get_last_inserted_id = "SELECT LAST_INSERT_ID() AS newDishId";

            db.query(sql_get_last_inserted_id, (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Error retrieving last inserted ID.");
                }

                // Retrieve the new dish ID from the query result
                const newDishId = result[0].newDishId;

                // Redirect with the new dish ID
                res.redirect(`/mIngredients/${newDishId}`);
            });
        });
    });
}
});
//todo: check
//Add New Dish Button (dish.ejs)
app.get("/mIngredientsNew", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else{
	const roleallowed = ["admin", "chef", "stock controller"];
	accessControl(res, session.userid, session.userrole, roleallowed);

	let sql_checkExistingDish = `
	SELECT *
	FROM dish
	ORDER BY dish_id DESC
	LIMIT 1
  `;

	let query_checkExistingDish = db.query(
		sql_checkExistingDish,
		(err, result) => {
			if (err) {
				console.error(err);
				return;
			}

			if (result[0].price != 0) {
				// Run the insert statement if there are no existing records
				let dish_new = `
		  INSERT INTO dish(dish_name, is_disabled, price, status) VALUES ('', 0, 0,'Incomplete');
		`;

				let newDish = db.query(dish_new, (err, new_dish) => {
					let sql_mIngredients = `
		  SELECT * 
		  FROM ingredients 
		  JOIN dish_ingredients ON ingredients.ingredient_id = dish_ingredients.ingredient_id 
		  JOIN unit ON ingredients.ingredient_base_unit = unit.unit_id 
		  WHERE dish_ingredients.dish_id = (
			SELECT MAX(dish_id)
			FROM dish
		  )
		  AND dish_ingredients.is_disabled = '0'
		`;

					let sql_newDish = `
		  SELECT * 
		  FROM dish
		  WHERE dish.dish_id = (
			SELECT MAX(dish_id)
			FROM dish
		  )
		  AND dish.is_disabled = '0';
		`;

					let sql_aIngredients = `
	SELECT *
	FROM ingredients
	WHERE is_disabled = '0'
	AND ingredient_id NOT IN (
	SELECT ingredient_id
	FROM dish_ingredients
	WHERE dish_id = (
	  SELECT MAX(dish_id)
	  FROM dish
	)
	AND is_disabled = '0'
	)
  
	`;

					let sql_aUnits = `
	SELECT iu.*, u.unit_name
	FROM Ingredient_Units iu
	JOIN Unit u ON iu.unit_id = u.unit_id;
  
	`;

					let sql_unitAll = `
	SELECT * 
	FROM unit WHERE is_disabled = '0'
	`;

					let sql_unit = `
		SELECT *
	  FROM unit
	  WHERE is_disabled = '0'
	  AND unit_id NOT IN (
	  SELECT unit_id
	  FROM ingredient_units
	  WHERE ingredient_id = (
		SELECT MAX(ingredient_id)
		FROM ingredients
	  )
	  AND is_disabled = '0'
	  )
	  `;

					let query_aIngredients = db.query(
						sql_aIngredients,
						(err, Ingredients) => {
							let query_aUnits = db.query(sql_aUnits, (err, iUnits) => {
								let query_Dish = db.query(sql_newDish, (err, Dish) => {
									let query_mIngredients = db.query(
										sql_mIngredients,
										(err, mIngredient) => {
											let query_unitsAll = db.query(
												sql_unitAll,
												(err, unitsAll) => {
													let query_unit = db.query(sql_unit, (err, units) => {
														res.render("dishingredients", {
															mIngredient: mIngredient,
															Dish: Dish,
															Ingredients: Ingredients,
															iUnits: iUnits,
															unitsAll: unitsAll,
															units: units,
														});
													});
												}
											);
										}
									);
								});
							});
						}
					);
				});
			} else {
				// Retrieve the existing dish and dish ingredients
				let sql_mIngredients = `
		  SELECT * 
		  FROM ingredients 
		  JOIN dish_ingredients ON ingredients.ingredient_id = dish_ingredients.ingredient_id 
		  JOIN unit ON ingredients.ingredient_base_unit = unit.unit_id 
		  WHERE dish_ingredients.dish_id = (
			SELECT MAX(dish_id)
			FROM dish
		  )
		  AND dish_ingredients.is_disabled = '0'
		`;

				let sql_newDish = `
		  SELECT * 
		  FROM dish
		  WHERE dish.dish_id = (
			SELECT MAX(dish_id)
			FROM dish
		  )
		  AND dish.is_disabled = '0';
		`;

				let sql_aIngredients = `
	SELECT *
	FROM ingredients
	WHERE is_disabled = '0'
	AND ingredient_id NOT IN (
	SELECT ingredient_id
	FROM dish_ingredients
	WHERE dish_id = (
	  SELECT MAX(dish_id)
	  FROM dish
	)
	AND is_disabled = '0'
	)
  
	`;

				let sql_aUnits = `
	SELECT iu.*, u.unit_name
	FROM Ingredient_Units iu
	JOIN Unit u ON iu.unit_id = u.unit_id;
  
	`;

				let sql_unitAll = `
	SELECT * 
	FROM unit WHERE is_disabled = '0'
	`;

				let sql_unit = `
		SELECT *
	  FROM unit
	  WHERE is_disabled = '0'
	  AND unit_id NOT IN (
	  SELECT unit_id
	  FROM ingredient_units
	  WHERE ingredient_id = (
		SELECT MAX(ingredient_id)
		FROM ingredients
	  )
	  AND is_disabled = '0'
	  )
	  `;

				let query_aIngredients = db.query(
					sql_aIngredients,
					(err, Ingredients) => {
						let query_aUnits = db.query(sql_aUnits, (err, iUnits) => {
							let query_Dish = db.query(sql_newDish, (err, Dish) => {
								let query_mIngredients = db.query(
									sql_mIngredients,
									(err, mIngredient) => {
										let query_unitsAll = db.query(
											sql_unitAll,
											(err, unitsAll) => {
												let query_unit = db.query(sql_unit, (err, units) => {
													res.render("dishingredients", {
														mIngredient: mIngredient,
														Dish: Dish,
														Ingredients: Ingredients,
														iUnits: iUnits,
														unitsAll: unitsAll,
														units: units,
													});
												});
											}
										);
									}
								);
							});
						});
					}
				);
			}
		}
	);
	}
});

//Add ingredient in dish_ingredients (dishingredients.ejs)
app.post("/save_mIngredients/:Id", (req, res) => {
	tempIngredientsData = JSON.parse(req.body.tempIngredientsData);
	const ID = req.params.Id;

	let sql_updateStatus = `
	UPDATE dish SET status = 'Pending' WHERE dish.dish_id = ${ID}
	`;

	for (var i in tempIngredientsData) {
		let sql_newIngredient = `
		INSERT INTO dish_ingredients(dish_id, ingredient_id, unit_id, amount, is_disabled) 
		VALUES (${ID}, ${tempIngredientsData[i].ingredient}, ${tempIngredientsData[i].unit}, ${tempIngredientsData[i].amount}, 0);
		`;

		let query_insertIngredient = db.query(
			sql_newIngredient,
			(err, newIngredient) => {}
		);
	}

	let query_updateStatus = db.query(
		sql_updateStatus,
		(err, updateStatus) => {}
	);

	res.redirect(`/mIngredients/${ID}`);
});

//Display dish_ingredients (dishingredients.ejs)
app.get("/mIngredients/:Id", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else{
	const roleallowed = ["admin", "chef", "stock controller"];
	accessControl(res, session.userid, session.userrole, roleallowed);
	const ID = req.params.Id;

	let sql_mIngredients = `
	SELECT * 
	FROM ingredients 
	JOIN dish_ingredients ON ingredients.ingredient_id = dish_ingredients.ingredient_id 
	JOIN unit ON dish_ingredients.unit_id = unit.unit_id 
	WHERE dish_ingredients.dish_id = ${ID} 
	AND dish_ingredients.is_disabled = '0'
  
	`;

	let sql_Dish = `
	SELECT * 
	FROM dish 
	WHERE dish.dish_id = ${ID} 
	AND dish.is_disabled = '0'
  
	`;

	let sql_aIngredients = `
	SELECT *
	FROM ingredients
	WHERE is_disabled = '0'
	AND ingredient_id NOT IN (
	SELECT ingredient_id
	FROM dish_ingredients
	WHERE dish_id = ${ID}
	AND is_disabled = '0'
	)
  
	`;

	let sql_aUnits = `
	SELECT iu.*, u.unit_name
	FROM Ingredient_Units iu
	JOIN Unit u ON iu.unit_id = u.unit_id;
  
	`;

	let sql_unitAll = `
	SELECT *
	FROM unit WHERE is_disabled = '0'
	`;

	let sql_unit = `
		SELECT *
	  FROM unit
	  WHERE is_disabled = '0'
	  AND unit_id NOT IN (
	  SELECT unit_id
	  FROM ingredient_units
	  WHERE ingredient_id = (
		SELECT MAX(ingredient_id)
		FROM ingredients
	  )
	  AND is_disabled = '0'
	  )
	  `;

	let query_aIngredients = db.query(sql_aIngredients, (err, Ingredients) => {
		let query_aUnits = db.query(sql_aUnits, (err, iUnits) => {
			let query_Dish = db.query(sql_Dish, (err, Dish) => {
				let query_mIngredients = db.query(
					sql_mIngredients,
					(err, mIngredient) => {
						let query_unitsAll = db.query(sql_unitAll, (err, unitsAll) => {
							let query_unit = db.query(sql_unit, (err, units) => {
								res.render("dishingredients", {
									mIngredient: mIngredient,
									Dish: Dish,
									Ingredients: Ingredients,
									iUnits: iUnits,
									unitsAll: unitsAll,
									units: units,
								});
							});
						});
					}
				);
			});
		});
	});
}
});

//Add name of Dish in dish_ingredients (dishingredients.ejs)
app.post("/addNameDish/:Id", (req, res) => {
	const ID = req.params.Id;
	dish_name = req.body.input1;
	dish_price = req.body.input2;

	let dish_nameSet = `
	UPDATE dish SET dish_name = '${dish_name}',price = ${dish_price} WHERE dish.dish_id = ${ID}
	`;

	let newDish = db.query(dish_nameSet, (err, new_dish) => {
		let sql_mIngredients = `
	  SELECT * 
	  FROM ingredients 
	  JOIN dish_ingredients ON ingredients.ingredient_id = dish_ingredients.ingredient_id 
	  JOIN unit ON ingredients.ingredient_base_unit = unit.unit_id 
	  WHERE dish_ingredients.dish_id = ${ID} 
	  AND dish_ingredients.is_disabled = '0'
	
	  `;

		let sql_Dish = `
	  SELECT * 
	  FROM dish 
	  WHERE dish.dish_id = ${ID} 
	  AND dish.is_disabled = '0'
	
	  `;

		let sql_aIngredients = `
	SELECT *
	FROM ingredients
	WHERE is_disabled = '0'
	AND ingredient_id NOT IN (
	SELECT ingredient_id
	FROM dish_ingredients
	WHERE dish_id = ${ID}
	AND is_disabled = '0'
	)
  
	`;

		let sql_aUnits = `
	SELECT iu.*, u.unit_name
	FROM Ingredient_Units iu
	JOIN Unit u ON iu.unit_id = u.unit_id;
  
	`;

		let sql_unitAll = `
	SELECT *
	FROM unit WHERE is_disabled = '0'
	`;

		let sql_unit = `
		SELECT *
	  FROM unit
	  WHERE is_disabled = '0'
	  AND unit_id NOT IN (
	  SELECT unit_id
	  FROM ingredient_units
	  WHERE ingredient_id = (
		SELECT MAX(ingredient_id)
		FROM ingredients
	  )
	  AND is_disabled = '0'
	  )
	  `;

		let query_aIngredients = db.query(sql_aIngredients, (err, Ingredients) => {
			let query_aUnits = db.query(sql_aUnits, (err, iUnits) => {
				let query_Dish = db.query(sql_Dish, (err, Dish) => {
					let query_mIngredients = db.query(
						sql_mIngredients,
						(err, mIngredient) => {
							let query_unitsAll = db.query(sql_unitAll, (err, unitsAll) => {
								let query_unit = db.query(sql_unit, (err, units) => {
									res.render("dishingredients", {
										mIngredient: mIngredient,
										Dish: Dish,
										Ingredients: Ingredients,
										iUnits: iUnits,
										unitsAll: unitsAll,
										units: units,
									});
								});
							});
						}
					);
				});
			});
		});
	});
});

//Add new unit in dish_ingredients (dishingredients.ejs)
app.post("/addUnitDI/:Id", (req, res) => {
	const ID = req.params.Id;

	unit_name = req.body.unit_name;
	unit_symbol = req.body.unit_symbol;
	multiplier = req.body.unit_multiplier;
	ingredient_id = req.body.ingredient;
	sub_unit = req.body.sub_unit;

	console.log("test: " + sub_unit);

	let sql_maxUnit = `
	SELECT MAX(unit_id)
	FROM unit;
	`;

	let sql_newUnit = `
	INSERT INTO unit(unit_name, unit_symbol, is_disabled) VALUES ('${unit_name}', '${unit_symbol}', 0); 
	`;

	console.log(typeof sub_unit === "undefined");

	if (typeof sub_unit === "undefined") {
		console.log("hello im here");
		let query_insertnewUnit = db.query(sql_newUnit, (err, newUnit) => {
			let query_selectMax = db.query(sql_maxUnit, (err, maxUnit) => {
				const maxUnitValue = maxUnit[0]["MAX(unit_id)"];

				let iUnit_New = `
			INSERT INTO ingredient_units(ingredient_id, unit_id, multiplier, is_disabled) 
			VALUES (${ingredient_id}, '${maxUnitValue}',${multiplier},0);
			`;

				let query_insertNewiUnit = db.query(iUnit_New, (err, iUnitNew) => {
					if (err) {
						console.log("Error while inserting new ingredient unit:", err);
					} else {
						console.log("New ingredient unit inserted successfully!");
					}

					res.redirect(`/mIngredients/${ID}`);
				});
			});
		});
	} else {
		let subUnit_New = `
		INSERT INTO ingredient_units(ingredient_id, unit_id, multiplier, is_disabled) 
		VALUES (${ingredient_id}, '${sub_unit}',${multiplier},0);
		`;

		let query_newiUnit = db.query(subUnit_New, (err, subUnits) => {
			res.redirect(`/mIngredients/${ID}`);
		});
	}
});

app.post("/addUnitIU/:Id", (req, res) => {
	const ID = req.params.Id;

	unit_name = req.body.unit_name;
	unit_symbol = req.body.unit_symbol;

	let sql_newUnit = `
	INSERT INTO unit(unit_name, unit_symbol, is_disabled) VALUES ('${unit_name}', '${unit_symbol}', 0); 
	`;

	let query_insertnewUnit = db.query(sql_newUnit, (err, newUnit) => {
		res.redirect(`/iUnits/${ID}`);
	});
});

//Display ingredients (ingredients.ejs)
app.get("/ingredients", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else{
	const roleallowed = ["admin", "chef", "stock controller"];
	accessControl(res, session.userid, session.userrole, roleallowed);
	let sql_ingredients = `
	SELECT * FROM ingredients 
	JOIN unit ON ingredient_base_unit = unit_id 
	WHERE ingredients.is_disabled = '0'
	`;

	let query_ingredients = db.query(sql_ingredients, (err, ingredient) => {
		res.render("ingredients", {
			ingredient: ingredient,
		});
	});
}
});

//Add New Ingredient Button (ingredients.ejs)
app.get("/iUnitsNew", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else{
	const roleallowed = ["admin", "chef", "stock controller"];
	accessControl(res, session.userid, session.userrole, roleallowed);

	let sql_checkExistingIngredient = `
	SELECT *
	FROM ingredients
	ORDER BY ingredient_id DESC
	LIMIT 1
  `;

	let query_checkExistingIngredient = db.query(
		sql_checkExistingIngredient,
		(err, result) => {
			if (err) {
				console.error(err);
				return;
			}

			if (result[0].ingredient_name.length !== 0) {
				let ingredient_new = `
		  INSERT INTO ingredients(ingredient_base_unit, amount, ingredient_name, is_disabled) 
		  VALUES (0, 1,'',0);
		`;

				let newingredient = db.query(ingredient_new, (err, new_ingredient) => {
					let sql_iUnits = `
		  SELECT unit.unit_name, ingredient_units.multiplier 
		  FROM unit,ingredient_units 
		  WHERE unit.unit_id = ingredient_units.unit_id 
		  AND ingredient_units.ingredient_id = (
		  SELECT MAX(ingredient_id)
		  FROM ingredients
		  ) 
		  AND ingredient_units.is_disabled = '0'
		  `;

					let sql_newIngredient = `
		  SELECT * 
		  FROM ingredients
		  WHERE ingredients.ingredient_id = (
			SELECT MAX(ingredient_id)
			FROM ingredients
		  )
		  AND ingredients.is_disabled = '0';
		`;

					let sql_unit = `
		SELECT *
	  FROM unit
	  WHERE is_disabled = '0'
	  AND unit_id NOT IN (
	  SELECT unit_id
	  FROM ingredient_units
	  WHERE ingredient_id = (
		SELECT MAX(ingredient_id)
		FROM ingredients
	  )
	  AND is_disabled = '0'
	  )
	  `;

					let sql_ingredients = `
	SELECT * FROM ingredients 
	JOIN unit ON ingredient_base_unit = unit_id 
	WHERE ingredients.is_disabled = '0'
	`;

					let sql_unitAll = `
	SELECT unit_name,unit_symbol 
	FROM unit WHERE is_disabled = '0'
	`;

					let query_unit = db.query(sql_unit, (err, units) => {
						let query_iUnitsNew = db.query(
							sql_newIngredient,
							(err, Ingredient) => {
								let query_iUnits = db.query(sql_iUnits, (err, iUnits) => {
									let query_ingredients = db.query(
										sql_ingredients,
										(err, ingredients) => {
											let query_unitsAll = db.query(
												sql_unitAll,
												(err, unitsAll) => {
													res.render("ingredientsunit", {
														iUnits: iUnits,
														Ingredient: Ingredient,
														units: units,
														ingredients: ingredients,
														unitsAll: unitsAll,
													});
												}
											);
										}
									);
								});
							}
						);
					});
				});
			} else {
				let sql_iUnits = `
		  SELECT unit.unit_name, ingredient_units.multiplier 
		  FROM unit,ingredient_units 
		  WHERE unit.unit_id = ingredient_units.unit_id 
		  AND ingredient_units.ingredient_id = (
		  SELECT MAX(ingredient_id)
		  FROM ingredients
		  ) 
		  AND ingredient_units.is_disabled = '0'
		  `;

				let sql_newIngredient = `
		  SELECT * 
		  FROM ingredients
		  WHERE ingredients.ingredient_id = (
			SELECT MAX(ingredient_id)
			FROM ingredients
		  )
		  AND ingredients.is_disabled = '0';
		`;

				let sql_unit = `
		SELECT *
	  FROM unit
	  WHERE is_disabled = '0'
	  AND unit_id NOT IN (
	  SELECT unit_id
	  FROM ingredient_units
	  WHERE ingredient_id = (
		SELECT MAX(ingredient_id)
		FROM ingredients
	  )
	  AND is_disabled = '0'
	  )
	  `;

				let sql_ingredients = `
	  SELECT * FROM ingredients 
	  JOIN unit ON ingredient_base_unit = unit_id 
	  WHERE ingredients.is_disabled = '0'
	  `;

				let sql_unitAll = `
	SELECT unit_name,unit_symbol 
	FROM unit WHERE is_disabled = '0'
	`;

				let query_unit = db.query(sql_unit, (err, units) => {
					let query_iUnitsNew = db.query(
						sql_newIngredient,
						(err, Ingredient) => {
							let query_iUnits = db.query(sql_iUnits, (err, iUnits) => {
								let query_ingredients = db.query(
									sql_ingredients,
									(err, ingredients) => {
										let query_unitsAll = db.query(
											sql_unitAll,
											(err, unitsAll) => {
												res.render("ingredientsunit", {
													iUnits: iUnits,
													Ingredient: Ingredient,
													units: units,
													ingredients: ingredients,
													unitsAll: unitsAll,
												});
											}
										);
									}
								);
							});
						}
					);
				});
			}
		}
	);
	}
});

//Display ingredients_units (ingredientsunits.ejs)
app.get("/iUnits/:Id", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else{
	const roleallowed = ["admin", "chef", "stock controller"];
	accessControl(res, session.userid, session.userrole, roleallowed);
	const ID = req.params.Id;

	let sql_iUnits = `
	SELECT unit.unit_name, ingredient_units.multiplier 
	FROM unit,ingredient_units 
	WHERE unit.unit_id = ingredient_units.unit_id 
	AND ingredient_units.ingredient_id = ${ID} 
	AND ingredient_units.is_disabled = '0'
	`;

	let sql_newIngredient = `
		  SELECT * 
		  FROM ingredients
		  WHERE ingredients.ingredient_id = ${ID}
		  AND ingredients.is_disabled = '0';
		`;

	let sql_unit = `
		SELECT *
	  FROM unit
	  WHERE is_disabled = '0'
	  AND unit_id NOT IN (
	  SELECT unit_id
	  FROM ingredient_units
	  WHERE ingredient_id = ${ID}
	  AND is_disabled = '0'
	  )
	  `;
	let sql_ingredients = `
	  SELECT * FROM ingredients 
	  JOIN unit ON ingredient_base_unit = unit_id 
	  WHERE ingredients.is_disabled = '0'
	  `;

	let sql_unitAll = `
	  SELECT unit_name,unit_symbol 
	  FROM unit WHERE is_disabled = '0'
	  `;

	let query_unit = db.query(sql_unit, (err, units) => {
		let query_iUnitsNew = db.query(sql_newIngredient, (err, Ingredient) => {
			let query_iUnits = db.query(sql_iUnits, (err, iUnits) => {
				let query_ingredients = db.query(
					sql_ingredients,
					(err, ingredients) => {
						let query_unitsAll = db.query(sql_unitAll, (err, unitsAll) => {
							res.render("ingredientsunit", {
								iUnits: iUnits,
								Ingredient: Ingredient,
								units: units,
								ingredients: ingredients,
								unitsAll: unitsAll,
							});
						});
					}
				);
			});
		});
	});
}
});

//Add name of ingredient in ingredients_unit (ingredientsunit.ejs)
app.post("/addNameIngredient/:Id", (req, res) => {
	const ID = req.params.Id;
	ingredient_name = req.body.input1;
	base_unit = req.body.units;

	let ingredient_nameSet = `
	UPDATE ingredients SET ingredient_name = '${ingredient_name}',
	ingredient_base_unit = ${base_unit} 
	WHERE ingredients.ingredient_id = ${ID}
	`;

	let iUnit_New = `
		INSERT INTO ingredient_units(ingredient_id, unit_id, multiplier, is_disabled) 
		VALUES (${ID}, ${base_unit},1,0);
		`;

	let newIngredient = db.query(ingredient_nameSet, (err, new_ingredient) => {
		let query_newiUnit = db.query(iUnit_New, (err, iUnits) => {
			res.redirect(`/iUnits/${ID}`);
		});
	});
});

//Add new sub-units of ingredient in ingredients_unit (ingredientsunit.ejs)
app.post("/addSubUnit/:Id", (req, res) => {
	const ID = req.params.Id;
	sub_unit = req.body.sub_unit;
	multiplier = req.body.multiplier;

	let subUnit_New = `
		INSERT INTO ingredient_units(ingredient_id, unit_id, multiplier, is_disabled)
		VALUES (${ID}, ${sub_unit},${multiplier},0);
		`;

	let query_newiUnit = db.query(subUnit_New, (err, subUnits) => {
		res.redirect(`/iUnits/${ID}`);
	});
});

//Display units (unit.ejs)
app.get("/unit", (req, res) => {
	if (session === undefined || session.userid === undefined) res.redirect("/");
	else{
	const roleallowed = ["admin", "chef", "stock controller"];
	accessControl(res, session.userid, session.userrole, roleallowed);

	let sql_unit = `
	SELECT unit_name,unit_symbol 
	FROM unit WHERE is_disabled = '0'
	`;

	let query_unit = db.query(sql_unit, (err, unit) => {
		res.render("unit", {
			unit: unit,
		});
	});
}
});

//Add unit button (unit.ejs)
app.post("/addUnit", (req, res) => {
	input1 = req.body.input1;
	input2 = req.body.input2;

	let add_unit = `
	INSERT INTO unit(unit_name, unit_symbol, is_disabled) VALUES ('${input1}', '${input2}', 0);
	`;

	let add = db.query(add_unit, (err, unit) => {
		res.redirect(`/unit`);
	});
});

//END- create user
app.get("*", (req, res) => {
	res.status(404).send("Page not found");
});
app.listen(3000, function () {
	console.log("server started on port 3000");
});
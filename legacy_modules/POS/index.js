const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
var mysql = require('mysql2');
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

//START- database connections
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "TwiceFan0923_",
  database: "itisdev_db"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
//END - database connections
app.use(express.json());

app.get("/", (req, res) => {
  const menuquery = 'SELECT menu_id, menu_name, price FROM menu WHERE is_disabled != 1';
  db.query(menuquery, (err, menuresults) => {
    if (err) {
      console.error('Error fetching data from MySQL:', err);
      return;
    }
    const product = {name:  menuresults.map((row) => row.menu_name)
                  , price:  menuresults.map((row) => row.price)
                  , id:     menuresults.map((row) => row.menu_id)};

    const menuingredientsquery = 'SELECT menu_id, ingredient_id, unit_id, amount FROM menu_ingredients WHERE is_disabled != 1';
    db.query(menuingredientsquery, (err, menuingredientsresults) => {
      if(err) {
        console.error('Error fetching data from MySQL:', err);
        return;
      }
      const menuingredients = {menuid:       menuingredientsresults.map((row) => row.menu_id)
                            , ingredientid:  menuingredientsresults.map((row) => row.ingredient_id)
                            , unitid:        menuingredientsresults.map((row) => row.unit_id)
                            , amount:        menuingredientsresults.map((row) => row.amount)};
      
      const ingredientsquery = 'SELECT ingredient_id, ingredient_base_unit, amount, ingredient_name FROM ingredients WHERE is_disabled != 1';
      db.query(ingredientsquery, (err, ingredientsresults) => {
        if(err) {
          console.error('Error fetching data from MySQL:', err);
          return;
        }
        const ingredients = {ingredientid:        ingredientsresults.map((row) => row.ingredient_id)
                          , ingredientbaseunit:   ingredientsresults.map((row) => row.ingredient_base_unit)
                          , amount:               ingredientsresults.map((row) => row.amount)
                          , name:                 ingredientsresults.map((row) => row.ingredient_name)};

        
        const ingredientunitsquery = 'SELECT ingredient_unit_id, ingredient_id, unit_id, multiplier FROM ingredient_units WHERE is_disabled != 1';
        db.query(ingredientunitsquery, (err, ingredientunitsresults) => {
          if(err) {
            console.error('Error fetching data from MySQL:', err);
            return;
          }
          const ingredientunits = {ingredientunitid:  ingredientunitsresults.map((row) => row.ingredient_unit_id)
                                , ingredientid:       ingredientunitsresults.map((row) => row.ingredient_id)
                                , unitid:             ingredientunitsresults.map((row) => row.unit_id)
                                , multiplier:         ingredientunitsresults.map((row) => row.multiplier)};

          const data = {product: product, menuingredients: menuingredients, ingredients: ingredients, ingredientunits: ingredientunits}
          res.render('pos', { data });
        });
      });
    });
  });
});

app.post("/checkout", (req, res) => {
  const itemNames       = JSON.parse(req.body.itemNames);
  const quantities      = JSON.parse(req.body.quantities);
  const itemIDs         = JSON.parse(req.body.itemIDs);
  const ingredientsUsed = JSON.parse(req.body.ingredientsUsed);

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
    db.query("INSERT INTO `itisdev_db`.`order`(`order_id`, `order_date`, `account_id`) VALUES (?, ?, 4)",
    [order_id, order_date],
    (err, result) => {
      if (err) {
        console.log("Error inserting order", err);
      }
    });

    // inserts the order list in the DB
    for (let i = 0; i < itemNames.length; i++){
      db.query("INSERT INTO `itisdev_db`.`order_list`(`order_id`, `menu_id`, `amount`) VALUES (?, ?, ?)",
      [order_id, itemIDs[i], quantities[i]],
      (err, result) => {
        if (err) {
          console.log("Error inserting order_list", err);
        }
      });
    }

    // updates the ingredients table in the DB
    for (let i = 0; i < ingredientsUsed.length; i++) {
      db.query("UPDATE `itisdev_db`.`ingredients` SET `amount` = ? WHERE `ingredient_id` = ?", 
      [ingredientsUsed[i].amount, ingredientsUsed[i].ingredientid],
      (err, result) => {
        if (err) {
          console.log("Error updating ingredients", err);
        }
      });
    }

  });

  res.redirect('/',)
});

app.listen(3000, function () {
  console.log("server started on port 3000");
});
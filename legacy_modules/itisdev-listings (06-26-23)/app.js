const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var mysql = require('mysql');
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "itisdev_db"
});
db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


//Display Menu (menu.ejs)
app.get("/", (req, res) =>{
  let sql_menu = `
  SELECT * FROM menu 
  WHERE is_disabled = '0'
  AND price != '0';
  `;

  let query_menu = db.query(sql_menu, (err,menu) => {
    res.render("menu",{
      menu: menu,
      
    });
  });
});

//Disable Menu (menu.ejs)
app.get("/menu_disable/:Id", (req, res) =>{

  const ID = req.params.Id;

  let menu_disabled = `
  UPDATE menu SET is_disabled = '1' WHERE menu.menu_id = ${ID}
  `;

  let disable = db.query(menu_disabled, (err,menu) => {
    let sql_menu = `
    SELECT * FROM menu WHERE is_disabled = '0'
    `;
  
    let query_menu = db.query(sql_menu, (err,menu) => {
      res.render("menu",{
        menu: menu,
        
      });
    });
  });
});


//Add New Menu Button (menu.ejs)
app.get("/mIngredientsNew", (req, res) => {
  let sql_checkExistingMenu = `
  SELECT *
  FROM menu
  ORDER BY menu_id DESC
  LIMIT 1
`;

  let query_checkExistingMenu = db.query(sql_checkExistingMenu, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    
    if (result[0].price !== 0) {
      // Run the insert statement if there are no existing records
      let menu_new = `
        INSERT INTO menu(menu_name, is_disabled, price) VALUES ('', 0, 0);
      `;

      let newMenu = db.query(menu_new, (err, new_menu) => {
        let sql_mIngredients = `
        SELECT * 
        FROM ingredients 
        JOIN menu_ingredients ON ingredients.ingredient_id = menu_ingredients.ingredient_id 
        JOIN unit ON ingredients.ingredient_base_unit = unit.unit_id 
        WHERE menu_ingredients.menu_id = (
          SELECT MAX(menu_id)
          FROM menu
        )
        AND menu_ingredients.is_disabled = '0'
      `;

      let sql_newMenu = `
        SELECT * 
        FROM menu
        WHERE menu.menu_id = (
          SELECT MAX(menu_id)
          FROM menu
        )
        AND menu.is_disabled = '0';
      `;

    

      let sql_aIngredients = `
  SELECT *
  FROM ingredients
  WHERE is_disabled = '0'
  AND ingredient_id NOT IN (
  SELECT ingredient_id
  FROM menu_ingredients
  WHERE menu_id = (
    SELECT MAX(menu_id)
    FROM menu
  )
  AND is_disabled = '0'
  )

  `;

  let sql_aUnits=`
  SELECT iu.*, u.unit_name
  FROM Ingredient_Units iu
  JOIN Unit u ON iu.unit_id = u.unit_id;

  `;


  let query_aIngredients = db.query(sql_aIngredients, (err,Ingredients) => {
    let query_aUnits = db.query(sql_aUnits, (err,iUnits) => {
      let query_Menu = db.query(sql_newMenu, (err,Menu) => {
        let query_mIngredients = db.query(sql_mIngredients, (err,mIngredient) => {
          res.render("menuingredients",{
            mIngredient: mIngredient,
            Menu:Menu,
            Ingredients,Ingredients,
            iUnits,iUnits
            
          });
        });
    
      
      });
     
    });
  });



      });
    } else {
      // Retrieve the existing menu and menu ingredients
      let sql_mIngredients = `
        SELECT * 
        FROM ingredients 
        JOIN menu_ingredients ON ingredients.ingredient_id = menu_ingredients.ingredient_id 
        JOIN unit ON ingredients.ingredient_base_unit = unit.unit_id 
        WHERE menu_ingredients.menu_id = (
          SELECT MAX(menu_id)
          FROM menu
        )
        AND menu_ingredients.is_disabled = '0'
      `;

      let sql_newMenu = `
        SELECT * 
        FROM menu
        WHERE menu.menu_id = (
          SELECT MAX(menu_id)
          FROM menu
        )
        AND menu.is_disabled = '0';
      `;

      let sql_aIngredients = `
  SELECT *
  FROM ingredients
  WHERE is_disabled = '0'
  AND ingredient_id NOT IN (
  SELECT ingredient_id
  FROM menu_ingredients
  WHERE menu_id = (
    SELECT MAX(menu_id)
    FROM menu
  )
  AND is_disabled = '0'
  )

  `;

  let sql_aUnits=`
  SELECT iu.*, u.unit_name
  FROM Ingredient_Units iu
  JOIN Unit u ON iu.unit_id = u.unit_id;

  `;


  let query_aIngredients = db.query(sql_aIngredients, (err,Ingredients) => {
    let query_aUnits = db.query(sql_aUnits, (err,iUnits) => {
      let query_Menu = db.query(sql_newMenu, (err,Menu) => {
        let query_mIngredients = db.query(sql_mIngredients, (err,mIngredient) => {
          res.render("menuingredients",{
            mIngredient: mIngredient,
            Menu:Menu,
            Ingredients,Ingredients,
            iUnits,iUnits
            
          });
        });
    
      
      });
     
    });
  });

    }
  });
});


//Display menu_ingredients (menuingredients.ejs)
app.get("/mIngredients/:Id", (req, res) =>{

  const ID = req.params.Id;

  let sql_mIngredients = `
  SELECT * 
  FROM ingredients 
  JOIN menu_ingredients ON ingredients.ingredient_id = menu_ingredients.ingredient_id 
  JOIN unit ON menu_ingredients.unit_id = unit.unit_id 
  WHERE menu_ingredients.menu_id = ${ID} 
  AND menu_ingredients.is_disabled = '0'

  `;

  let sql_Menu = `
  SELECT * 
  FROM menu 
  WHERE menu.menu_id = ${ID} 
  AND menu.is_disabled = '0'

  `;

  let sql_aIngredients = `
  SELECT *
  FROM ingredients
  WHERE is_disabled = '0'
  AND ingredient_id NOT IN (
  SELECT ingredient_id
  FROM menu_ingredients
  WHERE menu_id = ${ID}
  AND is_disabled = '0'
  )

  `;

  let sql_aUnits=`
  SELECT iu.*, u.unit_name
  FROM Ingredient_Units iu
  JOIN Unit u ON iu.unit_id = u.unit_id;

  `;


  let query_aIngredients = db.query(sql_aIngredients, (err,Ingredients) => {
    let query_aUnits = db.query(sql_aUnits, (err,iUnits) => {
      let query_Menu = db.query(sql_Menu, (err,Menu) => {
        let query_mIngredients = db.query(sql_mIngredients, (err,mIngredient) => {
          res.render("menuingredients",{
            mIngredient: mIngredient,
            Menu:Menu,
            Ingredients,Ingredients,
            iUnits,iUnits
            
          });

          
        });
    
      
      });
     
    });
  });

 

  
});

//Add name of Menu in menu_ingredients (menuingredients.ejs)
app.post("/addNameMenu/:Id", (req, res) =>{

  const ID = req.params.Id;
  menu_name = req.body.input1;
  menu_price = req.body.input2;

  let menu_nameSet = `
  UPDATE menu SET menu_name = '${menu_name}',price = ${menu_price} WHERE menu.menu_id = ${ID}
  `;

  

  let newMenu = db.query(menu_nameSet, (err,new_menu) => {

    let sql_mIngredients = `
    SELECT * 
    FROM ingredients 
    JOIN menu_ingredients ON ingredients.ingredient_id = menu_ingredients.ingredient_id 
    JOIN unit ON ingredients.ingredient_base_unit = unit.unit_id 
    WHERE menu_ingredients.menu_id = ${ID} 
    AND menu_ingredients.is_disabled = '0'
  
    `;
  
    let sql_Menu = `
    SELECT * 
    FROM menu 
    WHERE menu.menu_id = ${ID} 
    AND menu.is_disabled = '0'
  
    `;
  
    let sql_aIngredients = `
  SELECT *
  FROM ingredients
  WHERE is_disabled = '0'
  AND ingredient_id NOT IN (
  SELECT ingredient_id
  FROM menu_ingredients
  WHERE menu_id = ${ID}
  AND is_disabled = '0'
  )

  `;

  let sql_aUnits=`
  SELECT iu.*, u.unit_name
  FROM Ingredient_Units iu
  JOIN Unit u ON iu.unit_id = u.unit_id;

  `;


  let query_aIngredients = db.query(sql_aIngredients, (err,Ingredients) => {
    let query_aUnits = db.query(sql_aUnits, (err,iUnits) => {
      let query_Menu = db.query(sql_Menu, (err,Menu) => {
        let query_mIngredients = db.query(sql_mIngredients, (err,mIngredient) => {
          res.render("menuingredients",{
            mIngredient: mIngredient,
            Menu:Menu,
            Ingredients,Ingredients,
            iUnits,iUnits
            
          });
        });
    
      
      });
     
    });
  });

  
  });

});


//Add ingredient in menu_ingredients (menuingredients.ejs)
app.post("/addIngredient/:Id", (req, res) =>{

  const ID = req.params.Id;


  ingredient_id = req.body.ingredient;
  base_unit = req.body.unit;
  amount = req.body.amount;

  console.log(base_unit);

  let sql_newIngredient = `
  INSERT INTO menu_ingredients(menu_id, ingredient_id, unit_id, amount, is_disabled) 
  VALUES (${ID}, ${ingredient_id}, ${base_unit}, ${amount}, 0);
  `;


  let query_insertIngredient = db.query(sql_newIngredient, (err,newIngredient) => {
   
            res.redirect(`/mIngredients/${ID}`);
        
  });

 

 

  
});


//Display ingredients (ingredients.ejs)
app.get("/ingredients", (req, res) =>{
  let sql_ingredients = `
  SELECT * FROM ingredients 
  JOIN unit ON ingredient_base_unit = unit_id 
  WHERE ingredients.is_disabled = '0'
  `;

  let query_ingredients = db.query(sql_ingredients, (err,ingredient) => {
    res.render("ingredients",{
      ingredient: ingredient,
      
    });
  });
});


//Add New Ingredient Button (ingredients.ejs)
app.get("/iUnitsNew", (req, res) => {
  let sql_checkExistingIngredient = `
  SELECT *
  FROM ingredients
  ORDER BY ingredient_id DESC
  LIMIT 1
`;

  let query_checkExistingIngredient = db.query(sql_checkExistingIngredient, (err, result) => {
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
    
      let query_unit = db.query(sql_unit, (err,units) => {
        let query_iUnitsNew = db.query(sql_newIngredient, (err,Ingredient) => {
          let query_iUnits = db.query(sql_iUnits, (err,iUnits) => {
            res.render("ingredientsunit",{
              iUnits: iUnits,
              Ingredient:Ingredient,
              units,units
            });
            
            
          });
        });
      });

      

  
      });
    }

     else {
  
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
    
      let query_unit = db.query(sql_unit, (err,units) => {
        let query_iUnitsNew = db.query(sql_newIngredient, (err,Ingredient) => {
          let query_iUnits = db.query(sql_iUnits, (err,iUnits) => {
            res.render("ingredientsunit",{
              iUnits: iUnits,
              Ingredient:Ingredient,
              units,units
            });
          });
        });
      });
    }
  });
});

//Display ingredients_units (ingredientsunits.ejs)
app.get("/iUnits/:Id", (req, res) =>{

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
    
      let query_unit = db.query(sql_unit, (err,units) => {
        let query_iUnitsNew = db.query(sql_newIngredient, (err,Ingredient) => {
          let query_iUnits = db.query(sql_iUnits, (err,iUnits) => {
            res.render("ingredientsunit",{
              iUnits: iUnits,
              Ingredient:Ingredient,
              units,units
            });
          });
        });
      });
});

//Add name of ingredient in ingredients_unit (ingredientsunit.ejs)
app.post("/addNameIngredient/:Id", (req, res) =>{

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

  

  let newIngredient = db.query(ingredient_nameSet, (err,new_ingredient) => {

    
    
      let query_newiUnit = db.query(iUnit_New, (err,iUnits) => {
    
            res.redirect(`/iUnits/${ID}`);
       
    });

  
  });

});

//Add new sub-units of ingredient in ingredients_unit (ingredientsunit.ejs)
app.post("/addSubUnit/:Id", (req, res) =>{

  const ID = req.params.Id;
  sub_unit = req.body.sub_unit;
  multiplier = req.body.multiplier;



  let subUnit_New = `
      INSERT INTO ingredient_units(ingredient_id, unit_id, multiplier, is_disabled) 
      VALUES (${ID}, ${sub_unit},${multiplier},0);
      `;


    

      
    
      let query_newiUnit = db.query(subUnit_New, (err,subUnits) => {
      
            res.redirect(`/iUnits/${ID}`);
        
    });

  


});


//Display units (unit.ejs)
app.get("/unit", (req, res) =>{



  let sql_unit = `
  SELECT unit_name,unit_symbol 
  FROM unit WHERE is_disabled = '0'
  `;

  let query_unit = db.query(sql_unit, (err,unit) => {
    res.render("unit",{
      unit: unit,
      
    });
  });
});


//Add unit button (unit.ejs)
app.post("/addUnit", (req, res) =>{

  input1 = req.body.input1;
  input2 = req.body.input2;




  let add_unit = `
  INSERT INTO unit(unit_name, unit_symbol, is_disabled) VALUES ('${input1}', '${input2}', 0); 
  `;

  let add = db.query(add_unit, (err,unit) => {
      res.redirect(`/unit`);
    
  });
});









// app.get("/unit/:Id", (req, res) =>{

//   const ID = req.params.Id;

//   let unit_disabled = `
//   UPDATE unit SET is_disabled = '1' WHERE unit.unit_id = ${ID}
//   `;

//   let disable = db.query(unit_disabled, (err,unit) => {
//     let sql_unit = `
//   SELECT unit_name,unit_symbol 
//   FROM unit WHERE is_disabled = '0'
//   `;

//   let query_unit = db.query(sql_unit, (err,unit) => {
//     res.render("unit",{
//       unit: unit,
      
//     });
//   });
//   });
// });


// app.get("/ingredients/:Id", (req, res) =>{

//   const ID = req.params.Id;

//   let ingredient_disabled = `
//   UPDATE ingredients SET is_disabled = '1' WHERE ingredients.ingredient_id = ${ID}
//   `;

//   let disable = db.query(ingredient_disabled, (err,ingredient) => {
//     let sql_ingredients = `
//   SELECT * FROM ingredients 
//   JOIN unit ON ingredient_base_unit = unit_id 
//   WHERE ingredients.is_disabled = '0'
//   `;

//   let query_ingredients = db.query(sql_ingredients, (err,ingredient) => {
//     res.render("ingredients",{
//       ingredient: ingredient,
      
//     });
//   });
//   });
// });


app.listen( 3000, function () {
    console.log("server started on port 3000");
  });
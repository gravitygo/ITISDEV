const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
var mysql = require('mysql2');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const app = express();
const axios = require('axios');
const e = require('express');
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');


function accessControl(res,usersession,userrole,roleallowed){
  if(!usersession){
    res.redirect("/");
  }
  else if(!roleallowed.includes(session.userrole.toLowerCase())){
    res.render("restrictedaccesserror", {userrole:userrole});
  }
}
//will go to dashboard
function dashboardget(res){
  axios.get("http://localhost:3000/microservices/analytics")
    .then(response =>{
        res.render("dashboard", {result: response.data});
    })
    .catch(err => {
        res.status(500).send({error:err});
    });
}
//START- database connections
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "itisdev_db"
});


var session;


//sessionstart
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisisitisdevgroup4secrett32223",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
//END - database connections

app.use(function (req, res, next) {
  res.locals.username = req.session.userid;
  res.locals.userrole = req.session.userrole;
  next();
});

//START- initial render
app.get("/", (req, res) => {
  session=req.session;
  if(session.userid)
    dashboardget(res);
  else res.render("login", {message:""});
  
});
//END- initial render

//START- login render / also logout button
app.get("/login", (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/') // will always fire after session is destroyed
  })
  
});
//END- login render

//START- register render
app.get("/register", (req, res) => {
  const roleallowed = ['admin']
  accessControl(res,session.userid,session.userrole,roleallowed);
  res.render("register", {message:""});
});
//END- register render

//START- disable user
app.get("/disableuser/:username", (req, res) => {
  const roleallowed = ['admin']
  accessControl(res,session.userid,session.userrole,roleallowed);

  const username='"' + req.params.username + '"';
  var currentUser = username
  var usernamequery = "SELECT * FROM account WHERE username ="+currentUser;
  let query = db.query(usernamequery, (err, rows)=>{
    res.render("disableuser", {message:"", rows:rows});
  })
  
});
//END- disable user

//START- activate user
app.get("/activateuser/:username", (req, res) => {
  const roleallowed = ['admin']
  accessControl(res,session.userid,session.userrole,roleallowed);

  const username='"' + req.params.username + '"';
  var currentUser = username
  var usernamequery = "SELECT * FROM account WHERE username ="+currentUser;
  let query = db.query(usernamequery, (err, rows)=>{
    res.render("activate", {message:"", rows:rows});
  })
  
});
//END- activate user

//START- edit user
app.get("/edituser/:username", (req, res) => {
  const roleallowed = ['admin']
  accessControl(res,session.userid,session.userrole,roleallowed);
  const username='"' + req.params.username + '"';
  var currentUser = username
  var usernamequery = "SELECT * FROM account WHERE username ="+currentUser;
  let query = db.query(usernamequery, (err, rows)=>{
    res.render("edituser", {message:"", rows:rows, currentUserEdit:currentUser});
  })
  console.log(currentUser);
});
//END- edit user

//START- dashboard render
app.get("/dashboard", (req, res) => {
  const roleallowed = ['admin','stock-controller']
  accessControl(res,session.userid,session.userrole,roleallowed);
  dashboardget(res);
});
//END- dashboard render

//START- userlist
app.get("/userlist", (req, res) => {

  const roleallowed = ['admin']
  accessControl(res,session.userid,session.userrole,roleallowed);

  let thisIsMyQueryForUsers = `
SELECT
  *
  FROM
  account
  ORDER BY is_disabled asc
  `
  let query = db.query(thisIsMyQueryForUsers, (err,results) => {
    res.render("userlist", {
      results:results
    });

  })

});
//END- userlist


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
            session=req.session;
            session.userid=req.body.username;
            session.userrole=results[0].role;
            console.log(req.session)
            dashboardget(res);
        } else {
          // Passwords don't match
          res.render("login", { message: "Invalid username or password. Please try again.", username: username});
        }
      });
    } else {
      // Username doesn't exist in the account table
      res.render("login", { message: "Invalid username or password. Please try again.", username: username});
    }
  });
});
//END- login

//START- disable user
app.post("/disable-user", (req, res) => {
  const username = req.body.username;
  var disableQuery = "UPDATE account SET is_disabled = 1 WHERE username = ?";
  let query = db.query(disableQuery, [username], (err) => {
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
  let query = db.query(disableQuery, [username], (err) => {
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
  const { firstName, lastName, role, username, password, confirmPassword } = req.body;
  var currentUser = req.body.currentUser;
  currentUser = currentUser.replace(/['"]+/g, '')
  let usernamecheck = 0;
  const usernamequery = "SELECT * FROM account WHERE username = ?";
  //Checks if username/username already exists
  db.query(usernamequery, [username], function (err, results) {
    if (err) throw err;

    if (results.length > 0) {
      // Username exists in the account table
      if(results[0].username===currentUser){
        usernamecheck = 1;
      }else 
      return res.render("edituser", {
        message: "Username is taken, please enter a different username", fnameEdit: req.body.firstName, lnameEdit: req.body.lastName, unameEdit: req.body.username, roleEdit: req.body.role, currentUserEdit:currentUser
      });
    } else {
      usernamecheck = 1;
    }
  });

  //checks if password is appropriate length and if password is same as confirm password
  if (password !== confirmPassword || password.length < 8 || confirmPassword.length < 8) {
    if(password == "" && confirmPassword == ""){

    }
    else{
    return res.render("edituser", {
      message: "Passwords do not match or are less than 8 characters. Please re-enter the passwords.", fnameEdit: req.body.firstName, lnameEdit: req.body.lastName, unameEdit: req.body.username, roleEdit: req.body.role, currentUserEdit:currentUser
    });
  }
  }
  const newUser = {
    firstName,
    lastName,
    role,
    username,
  };
  if(password.length === 0){

    db.query(
      "UPDATE account SET fname = ?, lname = ?, role = ?, username = ? WHERE username = ?",
      [newUser.firstName, newUser.lastName, newUser.role, newUser.username, currentUser],
      (err, result) => {
        if (err) {
          console.log("Error inserting user data:", err);
          return res.render("edituser", {
            message: "An error occurred while creating the user. Please try again later."
          });
        }
        // User creation successful, redirect to a success page or appropriate route
        res.redirect("/userlist");
      }
    );
  }
  else{
  // Encrypt the password
  bcrypt.hash(password, 10, function (err, hashedPassword) {
    if (err) {
      console.log("Error hashing password:", err);
      return res.render("edituser", {
        message: "An error occurred while creating the user. Please try again later.", fnameEdit: req.body.firstName, lnameEdit: req.body.lastName, unameEdit: req.body.username, roleEdit: req.body.role, currentUserEdit:currentUser
      });
    }

    // Update the account table
    const newUser = {
      firstName,
      lastName,
      role,
      username,
      password: hashedPassword
    };

    if (usernamecheck === 1) {
      db.query(
        "UPDATE account SET fname = ?, lname = ?, password = ?, role = ?, username = ? WHERE username = ?",
        [newUser.firstName, newUser.lastName, newUser.password, newUser.role, newUser.username, currentUser],
        (err, result) => {
          if (err) {
            console.log("Error inserting user data:", err);
            return res.render("edituser", {
              message: "An error occurred while creating the user. Please try again later."
            });
          }
          // User creation successful, redirect to a success page or appropriate route
          res.redirect("/userlist");
        }
      );
    }
  });}
});
//END- edit user
//START- create user
app.post("/create-user", (req, res) => {
  const { firstName, lastName, role, username, password, confirmPassword } = req.body;
  let usernamecheck = 0;

  const usernamequery = "SELECT * FROM account WHERE username = ?";
  //Checks if username/username already exists
  db.query(usernamequery, [username], function (err, results) {
    if (err) throw err;

    if (results.length > 0) {
      // Username exists in the account table
      return res.render("register", { message: "Invalid username or password. Please try again.", fname: req.body.firstName, lname: req.body.lastName, uname: req.body.username, roler: req.body.role});
    } else {
      usernamecheck = 1;
    }
  });

  //checks if password is appropriate length and if password is same as confirm password
  if (password !== confirmPassword || password.length < 8 || confirmPassword.length < 8) {
    return res.render("register", {
      message: "Passwords do not match or are less than 8 characters. Please re-enter the passwords.", fname: req.body.firstName, lname: req.body.lastName, uname: req.body.username, roler: req.body.role
    });
  }

  // Encrypt the password
  bcrypt.hash(password, 10, function (err, hashedPassword) {
    if (err) {
      console.log("Error hashing password:", err);
      return res.render("register", {
        message: "An error occurred while creating the user. Please try again later.", fname: req.body.firstName, lname: req.body.lastName, uname: req.body.username, roler: req.body.role
      });
    }

    // Insert user data into the account table
    const newUser = {
      firstName,
      lastName,
      role,
      username,
      password: hashedPassword,
      isDisabled: 0
    };

    if (usernamecheck === 1) {
      db.query(
        "INSERT INTO `itisdev_db`.`account` (`fname`, `lname`, `password`, `role`, `username`, `is_disabled`) VALUES (?, ?, ?, ?, ?, 0)",
        [newUser.firstName, newUser.lastName, newUser.password, newUser.role, newUser.username],
        (err, result) => {
          if (err) {
            console.log("Error inserting user data:", err);
            return res.render("register", {
              message: "An error occurred while creating the user. Please try again later."
            });
          }

          // User creation successful, redirect to a success page or appropriate route
          res.redirect("/userlist");
        }
      );
    }
  });
});
//END- edi user

//INTEGRATION TEST - CHYLE
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

app.listen(3000, function () {
  console.log("server started on port 3000");
});

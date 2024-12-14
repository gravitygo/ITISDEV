// database.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost", // change to your database host
  user: "root", // change to your database user
  password: "12345", // change to your database password
  database: "itisdev_db" // change to your database name
});

module.exports = db;

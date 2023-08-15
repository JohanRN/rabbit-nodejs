const mysql = require('mysql');
const { DB_NAME, DB_HOST, DB_USER, DB_PASSWORD } = require('../config/environments');



const mysqlConnection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
});

module.exports = {
  mysqlConnection,
}
// const mysql = require("mysql2");

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   database: "ejsblog",
//   password: "123admin",
//   port: 3307,
// });

// module.exports = pool.promise();

// using sequelize
const Sequelize = require("sequelize");

const sequelize = new Sequelize("ejsblog", "root", "123admin", {
  host: "localhost",
  port: 3307,
  dialect: "mysql",
});

module.exports = sequelize;

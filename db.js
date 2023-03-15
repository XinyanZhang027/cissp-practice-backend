const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "certificate",
  password: "certificate",
  database: "certificate",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = {
  pool,
};

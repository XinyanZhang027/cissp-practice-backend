const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const { jwt_private_key } = require("./config");
const config = {
  host: "localhost",
  user: "certificate",
  password: "certificate",
  database: "certificate",
};

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Registration endpoint
app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Save the user to the database
  const conn = await mysql.createConnection(config);
  const [result] = await conn.execute(
    "INSERT INTO user (username, password, email) VALUES (?, ?, ?)",
    [username, hashedPassword, email]
  );
  conn.end();

  res.send({ success: true, message: "User registered successfully" });
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists in the database
  const conn = await mysql.createConnection(config);
  const [rows] = await conn.execute(
    "SELECT * FROM user WHERE username = ? LIMIT 1",
    [username]
  );
  conn.end();

  if (rows.length === 0) {
    return res
      .status(401)
      .send({ success: false, message: "Invalid username or password" });
  }

  const user = rows[0];

  // Check if the password is correct
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res
      .status(401)
      .send({ success: false, message: "Invalid username or password" });
  }

  // Generate a JWT token and send it in the response
  const token = jwt.sign({ userId: user.id }, jwt_private_key);
  res.send({ success: true, message: "Login successful", token });
});

// Exercise endpoint
app.get("/exercise", async (req, res) => {
  const conn = await mysql.createConnection(config);
  const [rows] = await conn.execute(
    "SELECT * FROM exercise ORDER BY RAND() LIMIT 1"
  );
  conn.end();
  res.send(rows[0]);
});

module.exports = app;

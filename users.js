const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("./db");
const { jwt_private_key } = require("./config");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Check if the user already exists
    const [rows] = await pool.query("SELECT * FROM user WHERE username = ?", [
      username,
    ]);

    if (rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User with that username already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the user to the database
    await pool.query(
      "INSERT INTO user (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email]
    );

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get the user from the database
    const [rows] = await pool.query("SELECT * FROM user WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = rows[0];

    // Check if the password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token and send it in the response
    const token = jwt.sign({ userId: user.id }, jwt_private_key);
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/exercise", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM exercise ORDER BY RAND() LIMIT 1"
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    const exercise = rows[0];
    res.json(exercise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

// Assignment 0: Set-up
const express = require("express");
const mysql = require("mysql2");
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);

// Assignment 1: Login
const cors = require("cors");
const PEPPER = String(process.env.PEPPER);

// Assignment 2: TOTP
const bcrypt = require("bcrypt");
const {createHmac} = require("crypto");
const TOTPSECRET = String(process.env.TOTPSECRET);

// Assignment 3: JWT
const jwt = require("jsonwebtoken");
const JWTSECRET = String(process.env.JWTSECRET);


// DO NOT REMOVE THIS LINE
const app = express();
app.use(express.json());
app.use(cors());
// DO NOT REMOVE THIS LINE
// DO NOT REMOVE THIS LINE
// Create a connection with a particular database: "users" database in this case
let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});
// DO NOT REMOVE THIS LINE


//=========================================================================================================

// Assignment 1: Login 
app.post("/login", function (request, response) {
  let body = request.body;
  let SQL = "SELECT * FROM users WHERE username=?";
  connection.query(SQL, body["username"], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("Database Error");
    } else {
      if (results.length === 0) {
        console.log("Username not found");
        return response.status(401).send("Unauthorized");
      } else {
        let combinedPass = results[0]["salt"] + body["password"] + PEPPER;
        bcrypt.compare(combinedPass, results[0]["password"], function(err, result) {
          if (err) {
            console.log(err);
            response.status(401).send("Unauthorized");
          } else {
            return response.status(200).send("Success");
          }
        });
      }
    }
  })
}); // END OF login API ROUTE

// Assignment 2: TOTP
app.post("/checkTOTP", function (request, response) {
  // Retrieve the manually generated 6-digit code from the textarea in totp.html
  const parsedBody = request.body;

  if (!parsedBody.hasOwnProperty("totp") || !parsedBody.hasOwnProperty("username")) {
    console.log("Incomplete Request");
    return response.status(415).send("Incomplete Request");
  }

  // Generate the TOTP from the button 
  const hmac = createHmac("sha256", TOTPSECRET);
  const ms = 1000 * 30;
  const timestamp = Math.round(new Date().getTime() / ms) * ms;
  hmac.update(timestamp.toString());

  const numberPattern = /\d+/g;
  const result = hmac.digest("hex").match(numberPattern).join("").slice(-6);
  console.log("Generated TOTP:", result);

  // Check if manual TOTP and button TOTP match
  if (parsedBody["totp"] === result) {
    // Query the database to find the user
    const SQL = "SELECT * FROM users WHERE username = ?";
    connection.query(SQL, [parsedBody["username"]], (error, results) => {
      if (error || results.length === 0) {
        console.log("User not found or database error");
        return response.status(401).send("Unauthorized");
      }

      // JWT token data
      const user = results[0];
      const payload = {
        username: user.username,
        email: user.email,
        role: user.role,
      };

      // Create a JWT token that expires in 1 hour
      const token = jwt.sign(payload, JWTSECRET, { expiresIn: "1h" });
      console.log("Generated JWT:", token);

      response.status(200).send(token);
    });
  } else {
    console.log("TOTP mismatch", result,parsedBody["totp"]);
    response.status(401).send("Code Comparison Failed");
  }
}); // END OF checkTOTP API ROUTE

// Assignment 3: JWT
// Validate the JWT token
app.post("/validateToken", (req, res) => {
  const token = req.headers["authorization"];

  console.log("Here is the token:", token);
  if (!token) {
      return res.status(401).send("Token missing");
  }

  try {
      // Verify the JWT token
      const payload = jwt.verify(token, JWTSECRET);

      console.log("Token valid. Payload:", payload);
      res.status(200).json({
          message: "Token valid",
          payload,
      });
  } catch (err) {
      console.error("Token invalid or expired:", err.message);
      res.status(401).send("Token invalid");
  }
});

// Assignment 4: Roles and Creativity
// Validate user details by verifying the token and checking the database
app.post("/verify-user-details", async (req, res) => {
  const { token } = req.body;

  if (!token) {
      return res.status(400).json({ message: "Missing token" });
  }

  try {
      console.log("Verifying token:", token);

      // Validate the token
      const decoded = jwt.verify(token, JWTSECRET);
      const { username } = decoded;

      if (!username) {
          return res.status(400).json({ message: "Invalid token: Missing username" });
      }

      console.log("Token decoded for username:", username);

      // Query the users table for user details
      const SQL = "SELECT * FROM users WHERE username = ?";
      connection.query(SQL, [username], (error, results) => {
          if (error) {
              console.error("Database error:", error.message);
              return res.status(500).json({ message: "Database error" });
          }

          if (results.length === 0) {
              return res.status(404).json({ message: "Username not found" });
          }

          const user = results[0];
          res.status(200).json({
              payload: {
                  username: user.username,
                  role: user.role,
              },
          });
      });
  } catch (err) {
      console.error("Error verifying user details:", err.message);
      res.status(500).json({ message: "Internal Server Error" });
  }
});


// API route to retrieve all users as JWT
// API route to retrieve username
app.post("/retrieve-username", (req, res) => {
  const { username } = req.body;

  if (!username) {
      return res.status(400).send("Missing username");
  }

  const SQL = "SELECT * FROM users WHERE username = ?";
  connection.query(SQL, [username], (error, results) => {
      if (error) {
          return res.status(500).send("Database error");
      }

      if (results.length === 0) {
          return res.status(404).send("Username not found");
      }

      res.status(200).send("Username validated");
  });
});

//=========================================================================================================

// DO NOT REMOVE THIS LINE
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
// DO NOT REMOVE THIS LINE
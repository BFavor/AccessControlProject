const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const generateTOTP = require('./totp-generator');// CONSTANTS 
const crypto = require("crypto");




const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const PEPPER = String(process.env.PEPPER);
const SECRET = String(process.env.SECRET)
const { exec } = require("child_process");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});




// Gets "query()" function from common.js
app.get("/query", function (request, response) {
  let SQL = "SELECT * FROM users;"
  connection.query(SQL, [true], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("database error");
    } else {
      console.log(results);
      response.send(results);
    }
  });
})


app.post("/login", function (request, response) {
  let parsedBody = request.body;

  let SQL = "SELECT * FROM users WHERE username = ?";
  connection.query(SQL, [parsedBody.username], (error, results, fields) => {
      if (error) {
          console.error("Database Error:\n", error.message);
          response.status(500).send("Server Error");
      } else if (results.length === 0) {
          console.log("User not found");
          response.status(401).send("Unauthorized");
      } else {
          let combinedPass = results[0]["salt"] + parsedBody["password"] + PEPPER;
          console.log(results[0]["salt"])
          console.log(parsedBody["password"])
          console.log(PEPPER)
          console.log(combinedPass)
          console.log(results[0]["password"])
          bcrypt.compare(combinedPass, results[0]["password"], function(err, result) {
              if (err) {
                  console.error("Error during bcrypt comparison:", err);
                  response.status(500).send("Server Error");
              } else if (!result) {
                  console.log("Password Mismatch");
                  response.status(401).send("Unauthorized");
              } else {
                  console.log(parsedBody["username"] + " logged in");
                  response.status(200).send("Success");
              }
          });
      }
  });
});

function back() {
  console.log("made it ");
  const time = Math.floor(Date.now() / 30000); //30,000 milliseconds
  const hash = crypto.createHmac("sha256", SECRET).update(String(time)).digest("hex");
  const totp = hash.match(/\d/g).join("").slice(0, 6); 
  return totp; 
}

app.get("/generateTOTP2", function (req, res) {
  back();
  try {
    const totp = back(); // Call the TOTP generator function
    console.log("Generated TOTP (backend):", totp);
    res.send(totp); // Send TOTP back to the client
  } catch (err) {
    console.error("Error generating TOTP:", err.message);
    res.status(500).send("Error generating TOTP");
  }
});


app.get("/generateTOTP", function (req, res) {
  try {
    const totp = generateTOTP(); // Call the TOTP generator function
    console.log("Generated TOTP (Server):", totp);
    res.send(totp); // Send TOTP back to the client
  } catch (err) {
    console.error("Error generating TOTP:", err.message);
    res.status(500).send("Error generating TOTP");
  }
});


app.use("/", express.static("frontend"));


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

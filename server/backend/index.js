const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

// CONSTANTS 
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const PEPPER = String(process.env.PEPPER);

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


app.use("/", express.static("frontend"));


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


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

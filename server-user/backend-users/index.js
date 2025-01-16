// Assignment 0: Set-up
const express = require("express");
const mysql = require("mysql2");
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);

// Assignment 1: Login
const PEPPER = String(process.env.PEPPER);

// Assignment 2: TOTP
const bcrypt = require("bcrypt");
const {createHmac} = require("crypto");
const TOTPSECRET = String(process.env.TOTPSECRET);

// Assignment 3: JWT
const jwt = require("jsonwebtoken");
const JWTSECRET = String(process.env.JWTSECRET);


// Don't delete this 
const app = express();
app.use(express.json());

// Create a connection with a particular database: "users" database in this case
let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


// Assignment 1: Login 
app.post("/login", function (request, response) {
  let body = request.body;

  if (!body.hasOwnProperty("username")){
    console.log("Incomplete Request");
    response.status(415).send("Incomplete Request");
  }

  let SQL = "SELECT * FROM users WHERE username=" + body["username"] + ";"
  connection.query(SQL, [true], (error, results, fields) => {
    if (error){
      console.error("DATABASE ERROR");
      response.status(500).send("Server Error");
    }
    else {
      if (results.length = 0) {
        console.log("Username not found");
        response.status(401).send("Unauthorized");
      } else {
        let combinedPass = results[0]["salt"] + body["password"] + PEPPER;
        bcrypt.compare(combinedPass, results[0]["password"], function(err, results) {
          if (err) {
            console.log(err);
            response.status(401).send("Unauthorized");
          } else {
            console.log(results);
            response.status(200).send("Success");
          }
        });
      }
    }
  })
}); // END OF login() FUNCTION 

// Assignment 2: TOTP
app.post("/checkTOTP", function (request, response) {
  let parsedBody = JSON.parse(request.body);
  console.log(parsedBody);
  if (!parsedBody.hasOwnProperty('totp')) {
    console.log("Incomplete Request");
    response.status(415).send("Incomplete Request");
  }

  const hmac = createHmac('sha256', TOTPSECRET);

  let ms = 1000 * 30;
  let timestamp = Math.round(new Date().getTime() / ms) * ms;
  console.log(timestamp);

  hmac.update(timestamp.toString());
  let numberPattern = /\d+/g;
  let result = hmac.digest('hex').match(numberPattern).join('').slice(-6);
  console.log(result);

  // check that totp is the same
  if(parsedBody["totp"] === result) {
    let userData = "SELECT * FROM users WHERE username=" + parsedBody["username"] + ";"
    // Create a JWT Token using the username and the JWTSECRET env variable
    // now you can just return the JWT as a string token to the frontend and the frontend will do something with it 
    let JWT = jwt.sign(userData, JWTSECRET);
    response.status(200).send(JWT);
  } else {
    response.status(401).send("Code Comparison Failed");
  }
}); // END OF checkTOTP() FUNCTION 

// Assignment 3: JWT
app.post("/verifyJWT", function (request, response) {
  // verify that the token is current and was made by this server
  // JWT.verify() documentation 

}); // END OF verifyJWT() FUNCTION

// Don't remove this 
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const {createHmac} = require("crypto");
const jwt = require("jsonwebtoken");

const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const PEPPER = String(process.env.PEPPER);
const TOTPSECRET = String(process.env.TOTPSECRET);
const JWTSECRET = String(process.env.JWTSECRET);


const app = express();
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


app.post("/login", function (request, response) {
  let body = JSON.parse(request.body);
  let sql = "SELECT * FROM users WHERE usernmae=" + body["username"] + ";"
  connection.query(SQL, [true], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("Database Error");
    } else {
      if (results.length = 0) {
        console.log("Username not found");
        response.status(401).send("Unauthorized");
      } else {
        let combinedPass = results[0]["salt"] + body['password'] + PEPPER;
        bcryot.compare(combinedPass, results[0]["password"], function(err, results) {
          if (err) {
            console.log(err);
            response.status(401).send("Unauthorized");
          } else {
            console.log(result);
            response.status(200).send("Success");
          }
        });
      }
    }
  })
});

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

  //var timestamp = new Date(Date.now());
  //timestamp.setSeconds(30);
  //timestamp.setMilliseconds(0);
  //console.log(timestamp);

  hmac.update(timestamp.toString());
  let numberPattern = /\d+/g;
  let result = hmac.digest('hex').match(numberPattern).join('').slice(-6);
  console.log(result);

  // check that totp is the same
  if(parsedBody["totp"] === result) {
    let userData = "SELECT * FROM users WHERE username=" + parsedbody["username"] + ";"
    let JWT = jwt.sign(userData, JWTSECRET);
    response.status(200).send(JWT);
  } else {
    response.status(401).send("Code Comparison Failed");
  }
});

app.post("/verifyJWT", function (request, response) {
  // verify that the token is current and was made by this server

})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

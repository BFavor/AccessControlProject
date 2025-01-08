const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);

const PEPPER = String(process.env.PEPPER);

const {createHmac} = require("crypto");

const app = express();
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


app.use("/", express.static("frontend"));


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
  //const {createHmac} = require("crypto");

  const hmac = createHmac('sha256', 'supersecretcode');

  var timestamp = new Date(Date.now());
  timestamp.setSeconds(30);
  timestamp.setMilliseconds(0);
  console.log(timestamp);

  hmac.update(timestamp.toString());
  let numberPattern = /\d+/g;
  let result = hmac.digest('hex').match(numberPattern).join('').slice(-6);
  console.log(result);
  if(parsedBody["totp"] === result) {
    response.status(200).send("Code Verification Successful");
  } else {
    response.status(401).send("Code Comparison Failed");
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

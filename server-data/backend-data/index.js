const express = require("express");
const mysql = require("mysql2");

const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);

const app = express();
app.use(express.json());

let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "things"
});

// Don't remove this line 
app.use("/", express.static("frontend"));

// Query the "things" database 
app.get("/query", function (request, response) {
  // get token from header
  // send token to server-user for verification in the verifyJWT() function 
  // if not successful, send 401 with message "Token invalid"
  
  // if successful: do the following
  let SQL = "SELECT * FROM things;"
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

// Don't remove this 
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

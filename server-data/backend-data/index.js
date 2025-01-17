const express = require("express");
const mysql = require("mysql2");

const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);

// use express to make this web application
const app = express();
app.use(express.json());

// connext to "things.sql" 
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
  const token = request.headers["authorization"];
  if (!token) {
    response.status(401).send("Token missing");
  }

  // Call the validateToken API Route in the other server
  fetch(`http://server-user:3000/validateToken`, {
      method: "POST",
      headers: { "Authorization": token }
  })
  .then((resp) => {
      if (resp.status === 200) {
          let SQL = "SELECT * FROM things;";
          connection.query(SQL, (error, results) => {
              if (error) {
                  console.error(error.message);
                  response.status(500).send("Database error");
              } else {
                // display that shit
                response.send(results);
              }
          });
      } else {
          response.status(401).send("Token invalid");
      }
  })
  .catch((err) => {
      console.error("Error validating token:", err);
      response.status(500).send("Token validation failed");
  });
});


// Don't remove this 
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

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
// DO NOT REMOVE THIS LINE 

//=========================================================================================================


// Query the "things" database 
app.get("/query", function (request, response) {
  const token = request.headers["authorization"];
  if (!token) {
    return response.status(401).send("Token missing");
  }

  // Call the validateToken API Route in the other server
  fetch(`http://server-user:3000/validateToken`, {
    method: "POST",
    headers: { "Authorization": token }
  })
  .then((resp) => {
    if (resp.status === 200) {
      // Parse the response JSON to access the payload
      return resp.json();
    } else {
      // Handle invalid token
      throw new Error("Token invalid");
    }
  })
  .then((data) => {
    // Extract payload data
    const { username, role } = data.payload; // Assuming the payload includes "username" and "role"
    console.log(`Token valid for user: ${username} with role: ${role}`);

    // Check if the user is an Admin
    if (role !== "Admin") {
      console.log(`Access denied for user: ${username} (Role: ${role})`);
      return response.status(403).send("Access forbidden: Insufficient privileges, Lame-o");
    }

    // Query the "things" database
    const SQL = "SELECT * FROM things1;";
    connection.query(SQL, (error, results) => {
      if (error) {
        console.error(error.message);
        response.status(500).send("Database error");
      } else {
        // Send query results
        response.send(results);
      }
    });
  })
  .catch((err) => {
    console.error("Error validating token or querying database:", err.message);
    response.status(401).send(err.message);
  });
}); // End of app.get("/query")


//=========================================================================================================

// Don't remove this 
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

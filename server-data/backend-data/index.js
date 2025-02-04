const express = require("express");
const mysql = require("mysql2");

const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const jwt = require("jsonwebtoken");
const JWTSECRET = String(process.env.JWTSECRET);

// use express to make this web application
const app = express();
app.use(express.json());

// connect to "things.sql" 
let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "things"
});

// DO NOT REMOVE THIS LINE 
app.use("/", express.static("frontend"));
// DO NOT REMOVE THIS LINE 

//=========================================================================================================
// query.html
//=========================================================================================================




function logAction(username, data_accessed, status) {
  fetch("http://server-user:3000/log-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          username: username || "Unknown",
          data_accessed: data_accessed,
          status: status
      })
  })
  .then(resp => resp.json())
  .then(data => console.log("Log entry created:", data))
  .catch(err => console.error("Error logging action:", err));
}




// Query the things1 table
app.get("/query", function (request, response) {
  const token = request.headers["authorization"];
  if (!token) {
      logAction("Unknown", "Query things1", "Failure");
      return response.status(401).send("Token missing");
  }

  fetch("http://server-user:3000/validateToken", {
      method: "POST",
      headers: { "Authorization": token }
  })
  .then(resp => {
      if (resp.status !== 200) throw new Error("Token invalid");
      return resp.json();
  })
  .then(data => {
      const { username, role } = data.payload;
      console.log(`Token valid for user: ${username}, Role: ${role}`);

      if (role !== "Lame-o" || role !== "Admin") {
          logAction(username, "Query things1", "Failure");
          return response.status(403).send("Access forbidden: Insufficient privileges, Mid or Admin");
      }

      const SQL = "SELECT * FROM things1;";
      connection.query(SQL, (error, results) => {
          if (error) {
              console.error(error.message);
              logAction(username, "Query things1", "Failure");
              return response.status(500).send("Database error");
          }

          logAction(username, "Query things1", "Success"); 
          response.send(results);
      });
  })
  .catch(err => {
      console.error("Error validating token or querying database:", err.message);
      logAction("Unknown", "Query things1", "Failure");
      response.status(401).send(err.message);
  });
});

// Query the things2 table
app.get("/query2", function (request, response) {
  const token = request.headers["authorization"];
  if (!token) {
      logAction("Unknown", "Query things2", "Failure");
      return response.status(401).send("Token missing");
  }

  fetch("http://server-user:3000/validateToken", {
      method: "POST",
      headers: { "Authorization": token }
  })
  .then(resp => {
      if (resp.status !== 200) throw new Error("Token invalid");
      return resp.json();
  })
  .then(data => {
      const { username, role } = data.payload;
      console.log(`Token valid for user: ${username}, Role: ${role}`);

      if (role !== "Mid" || role !== "Admin") {
          logAction(username, "Query things2", "Failure");
          return response.status(403).send("Access forbidden: Insufficient privileges, Lame-o or Admin");
      }

      const SQL = "SELECT * FROM things2;";
      connection.query(SQL, (error, results) => {
          if (error) {
              console.error(error.message);
              logAction(username, "Query things2", "Failure");
              return response.status(500).send("Database error");
          }

          logAction(username, "Query things2", "Success"); 
          response.send(results);
      });
  })
  .catch(err => {
      console.error("Error validating token or querying database:", err.message);
      logAction("Unknown", "Query things2", "Failure");
      response.status(401).send(err.message);
  });
});


// API route to update theme preference
// Validate and update user details in the things2 table
app.post("/validate-and-update-user", async (req, res) => {
  const { token } = req.body;

  if (!token) {
      return res.status(400).json({ message: "Missing token" });
  }

  try {
      console.log("Validating and updating user with token:", token);

      // Call the verify-user-details API
      const response = await fetch("http://server-user:3000/verify-user-details", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
      });

      if (response.status !== 200) {
          const error = await response.json();
          console.error("Error verifying user details:", error.message);
          return res.status(response.status).json(error);
      }

      const data = await response.json();
      const { username } = data.payload;

      console.log("Verified username:", username);

      // Insert or update the username and theme preference in the things2 table
      const defaultTheme = "dark"; // Replace with logic for current theme
      connection.query(
          "INSERT INTO things2 (username, theme_preference) VALUES (?, ?) ON DUPLICATE KEY UPDATE theme_preference = VALUES(theme_preference)",
          [username, defaultTheme],
          (error, results) => {
              if (error) {
                  console.error("Database error:", error.message);
                  return res.status(500).json({ message: "Database error" });
              }

              res.status(200).json({
                  payload: {
                      username,
                      role: data.payload.role,
                  },
              });
          }
      );
  } catch (err) {
      console.error("Error validating and updating user:", err.message);
      res.status(500).json({ message: "Internal Server Error" });
  }
});



app.post('/change-theme', async (req, res) => {
  const { token, theme } = req.body;

  console.log(":", token); // Debugging
  console.log("Received theme:", theme); // Debugging

  if (!token || !theme) {
      console.error("Missing token or theme preference");
      return res.status(400).json({ message: "Missing token or theme preference" });
  }

  const validThemes = ['dark', 'light'];
  
  if (!validThemes.includes(theme)) {
      console.error("Invalid theme preference:", theme);
      return res.status(400).json({ message: "Invalid theme preference" });
  }

  try {
      // Decode and verify the JWT
      const decoded = jwt.verify(token, process.env.JWTSECRET);
      console.log("Decoded JWT:", decoded); // Debugging

      const { username } = decoded;
      if (!username) {
          console.error("Invalid token: Missing username");
          return res.status(400).json({ message: "Invalid token: Missing username" });
      }

      // Insert or update the theme preference in the `things2` table
      const SQL = `
          INSERT INTO things2 (username, theme_preference)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE theme_preference = VALUES(theme_preference)
      `;

      connection.query(SQL, [username, theme], (error, results) => {
          if (error) {
              console.error("Database error:", error.message);
              return res.status(500).json({ message: "Database error" });
          }

          console.log("Database update successful:", results);
          res.status(200).json({ message: "Theme preference updated successfully" });
      });
  } catch (err) {
      console.error("Error updating theme preference:", err.message);
      res.status(500).json({ message: "Internal Server Error" });
  }
});




//=========================================================================================================

// Don't remove this 
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

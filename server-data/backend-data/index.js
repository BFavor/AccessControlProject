const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const sharp = require('sharp');
const fs = require('fs');

const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const JWTSECRET = String(process.env.JWTSECRET);

const app = express();
app.use(express.json());

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Database connection
let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "things"
});

// DO NOT REMOVE THIS LINE 
app.use("/", express.static("frontend")); 
app.use("/uploads", express.static("uploads")); 
// DO NOT REMOVE THIS LINE 

// =========================== PROFILE ROUTES ===========================

// Get user profile
app.get("/api/profile", async (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Token missing");

  try {
    const response = await fetch("http://server-user:3000/validateToken", {
      method: "POST",
      headers: { "Authorization": token }
    });
    if (response.status !== 200) throw new Error("Invalid token");

    const data = await response.json();
    const username = data.payload.username;

    connection.query("SELECT * FROM user_profiles WHERE username = ?", [username], (err, results) => {
      if (err) return res.status(500).send("Database error");
      if (results.length === 0) return res.status(404).send("Profile not found");
      res.json(results[0]);
    });
  } catch (err) {
    res.status(401).send(err.message);
  }
});

// Update user profile
app.post("/api/update-profile", upload.single("profile_picture"), async (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Token missing");

  try {
      const response = await fetch("http://server-user:3000/validateToken", {
          method: "POST",
          headers: { "Authorization": token }
      });
      if (response.status !== 200) throw new Error("Invalid token");

      const data = await response.json();
      const username = data.payload.username;

      const { bio, algae_facts } = req.body;

      let profile_picture = `/uploads/default-picture.jpeg`; // Default image path

      if (req.file) {
          const originalPath = req.file.path;

          // Resize to large (300x300)
          await sharp(originalPath)
              .resize(300, 300)
              .toFile(`./uploads/large_${req.file.filename}`);

          // Resize to small (50x50)
          await sharp(originalPath)
              .resize(50, 50)
              .toFile(`./uploads/small_${req.file.filename}`);

          profile_picture = `/uploads/large_${req.file.filename}`;
      }

      const SQL = `
          INSERT INTO user_profiles (username, bio, algae_facts, profile_picture)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
              bio = VALUES(bio),
              algae_facts = VALUES(algae_facts),
              profile_picture = COALESCE(VALUES(profile_picture), profile_picture)
      `;

      connection.query(SQL, [username, bio, algae_facts, profile_picture], (err) => {
          if (err) return res.status(500).send("Database error");
          res.send("Profile updated successfully");
      });
  } catch (err) {
      res.status(401).send(err.message);
  }
});

// =========================== EXISTING ROUTES ===========================

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

      if (role !== "Lame-o" && role !== "Admin") {
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

      if (role !== "Mid" && role !== "Admin") {
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

app.post("/validate-and-update-user", async (req, res) => {
  const { token } = req.body;

  if (!token) {
      return res.status(400).json({ message: "Missing token" });
  }

  try {
      const response = await fetch("http://server-user:3000/verify-user-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
      });

      if (response.status !== 200) {
          const error = await response.json();
          console.error("Error verifying user details:", error.message);
          return res.status(response.status).json(error);
      }

      const data = await response.json();
      const { username } = data.payload;

      const defaultTheme = "dark"; 
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
      const decoded = jwt.verify(token, JWTSECRET);
      const { username } = decoded;
      if (!username) {
          console.error("Invalid token: Missing username");
          return res.status(400).json({ message: "Invalid token: Missing username" });
      }

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

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

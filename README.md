# AccessControlProject
Contents: 
- Generalized Workflow 
- How It All Fits Together as of (12/20/2024)
- Adding Dependencies 
- Launching the Server 
- Shutting Down the Server 


## Generalized Workflow:
  ### Frontend (HTML + CSS + JavaScript):
    index.html:
        Serves as the main entry point for the web application.
        Provides a user interface with:
            Textboxes for username and password input.
            A login button styled with common.css.
        Includes common.js to handle user interactions and communicate with the backend.

    common.css:
        Provides styling for the HTML elements, such as background color and button appearance.

    common.js:
        Handles user interactions, such as:
            Sending login data (username and password) to the backend (/login endpoint) using a POST request.
            Fetching data from the backend (/query endpoint) to display on the frontend (if necessary).

  ### Backend (Node.js with Express):

      index.js:
          Sets up an Express.js server to handle incoming requests from the frontend.
          Endpoints:
              /login (POST):
                  Validates the user-provided credentials.
                  Retrieves the stored hash and salt for the provided username from the SQL database.
                  Reconstructs the password using the stored salt, user-provided password, and pepper.
                  Uses bcrypt.compare to verify if the reconstructed password matches the stored hash.
                  Responds with appropriate status codes:
                      200: Login successful.
                      401: Unauthorized (invalid credentials).
                      500: Server error (e.g., database issues).
              /query (GET):
                  Fetches and sends all user records from the SQL database (primarily for debugging or admin purposes).

      Middleware:
          cors: Enables Cross-Origin Resource Sharing, allowing the frontend and backend to communicate seamlessly.
          express.json(): Parses JSON request bodies.

  ### Database (MySQL):
      users.sql:
          Defines the structure of the users database, including:
              username (primary key).
              password (bcrypt-hashed).
              salt (used in password construction).
              email (user's email address).
          Populates the database with a test user:
              Username: "user".
              Password: "pass" (hashed with salt "90bb" and pepper during registration).

  ### Docker Container:

      Dockerfile (assumed):
          Builds a containerized environment for the application, bundling:
              Node.js runtime for running the backend (index.js).
              MySQL database to persist user data.
              Frontend files served statically through Express.

      docker-compose.yml (assumed):
          Manages multi-container setup:
              One container for the Node.js backend.
              Another container for the MySQL database.
          Defines environment variables (e.g., PORT, MYSQLHOST, MYSQLUSER, MYSQLPASS, PEPPER).

## How It All Fits Together (Assignment 2: Login DUE 12.20)

  ### User Interaction:
      The user opens the index.html page in their browser.
      They enter their username and password and click the login button.

  ### Frontend Sends Login Request:
      common.js captures the input, constructs a POST request, and sends it to the /login endpoint.

  ### Backend Processes Login:
      index.js receives the request and queries the database for the provided username.
      If the username exists:
          Combines the stored salt, user-provided password, and pepper to reconstruct the password.
          Uses bcrypt.compare to validate the reconstructed password against the stored hash.
      Responds to the frontend with:
          200 if the credentials are valid.
          401 if they are invalid.

  ### Frontend Displays Feedback:
      Based on the server's response, common.js displays an appropriate alert (e.g., "Login Successful!" or "Username or Password is incorrect").

  ### Database Stores User Data:
      The users.sql schema ensures user data is securely stored, with passwords hashed using bcrypt.

------------------------------
------------------------------
------------------------------

## Adding Dependencies: 
- Dependencies are like libraries in python, packages in java, and headerfiles in c
- Dependencies can be found in npmjs.com, along with their most recent version and documentation
- Dependencies can be defined in the `package.json` file
- After adding a dependency and the version you want in the json file's dictionary for dependencies,run the command: `docker compose build server`


## Launching the Server: 
  1. Within AccessControlProject folder: Compose server with: `sudo docker compose up mysql -d`
  - The `'d` flag means "deatached" which means it the sql server will be active in the background 
  1. Wait 10-30 seconds.
  2. WIthin AccessControlProject dolder: Compose application with: `sudo docker compose up server`


## Shutting Down the Server:
  1. Within AccessControlProject dolder: Compose application with: `sudo docker compose down server`
  3. Within AccessControlProject folder: Compose server with: `sudo docker compose down mysql` 




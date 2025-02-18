# AccessControlProject

<b>Contents:<b>
1. Developer workflow (How to run this thing as a developer)
2. Quick Guide: What the <i>hell</i> is Dr. John Spurgeon talking about
3. Quick Guide: How does this all work (How to use this thing as a user)


<b> Developer Workflow <b>
- `sudo docker compose build server-user server-data` To update Docker on any changes made to the server 
- `sudo docker compose up mysql-users mysql-data -d` To launch the sql databases
- `sudo docker compose up server-user server-data` To launch the servers
- `sudo docker compose down --volumes --remove-orphans` To close the servers and sql databases and reclaim allocated resources 
- `sudo docker exec -it accesscontrolproject-mysql-users-1 mysql -u root -p` in another terminal while the server is running to access the mysql container. Enter the password when prompted, which can be found in the docker-compose.yml file. 
    - USE users; 
    - SELECT * FROM users;
    - exit; 


## Quick Guide: What the <i>hell</i> is Dr. John Spurgeon talking about
1. Docker creates a virtual environment to build, test, and deploy applications. These virtual environments are called containers, and they can download whatever software they need in order to run. Think of it as a virtual machine on your virtual machine used strictly for creating and deploying applications. 
2. Docker projects have a `docker-compose.yml` file to list the services that'll run in a docker container and all of their qualities, including very important <u>environemental variables</u>. As of 01/16 our container currently is capable of running 2 Servers (`server-data` and `server-user`) and 2 SQL Databases (`sql-data` and `sql-users`). The servers each have `pacakge.json` files to specify what libraries/packages/dependencies they need, as well as `dockerfile` files that pretty much have docker instructions for how to run each service.
3. The server-data/frontend folder contains all of the files we'll need for a front end web page. But the most important file is `common.js`, where all of our functions will be declared and initialized, and call upon API Routes.
4. When Dr. John Spurgeon says "API" he's talking about a server's `backend/index.js` file. These files are incredibily important as they contain API Routes for `common.js` to call. API Routes can call other API Routes, and they typically return something; Either text or a status code, or a data structure, or all of the above. 
5. When Dr. John Spurgeon says "User Management API", he's talking about `server-user/backend-users/index.js`. This `index.js` file contains the API Routes for `login()`, `checkTOTP()`, and `validateToken()`.
6. When Dr. John Spurgeon says "Data Management API", he's talking about `server-data/backend-data/index.js`. This `index.js` file contains the API Routes for `query()`, which we'll use to query our `things.sql` database, which as of 01/16 is pretty bare, but we'll populate it later.   

## Quick Guide: How does this all work
1. After building both servers, composing up both databases, and composing up both servers, <u>we can go to 0.0.0.0:80 or localhost to get to our application</u>. 
2. <u>Type in a valid username and password and select the Login button.</u> So far, the only valid username and passwords are "user" and "pass" (no quotation marks). Behind the scenes, `server-data/frontend/index.html` calls the `login()` function in `server-data/frontend/common.js`, which calls the `/login` API route in `server-user/backend-users/index.js`. The special bcrypt library/module/package/dependency is used here to combine the salt and username entries from the users.sql database and concatonate it with the environmental variable known as pepper. Salt and Pepper are 4-digit hex codes used to create a "hashed" password that is very hard for nefarious hackers to guess each element of a password should they break into the docker container or acquire the users.sql database. `bcrypt.compare()` creates a hashed password and compares it with the entry in the "salt" column of `users.sql`. The entry in the "salt" column was made using bcrypt before, and since bcrypt is very very smart, it can look at a hashed password and if it has all the elements (salt,the actual password, and the pepper), it can determine if two hashed passwords match. If successful, the `/login` API Route returns a status code 200 to `login()`, creates a cookie onto the browser that contains just the username that was entered, and then the window location `location.href` takes us from `index.html` to `totp.html`. 
3. <u>Manually generate a one-time code using `2ndFactor App/totp.js` and submit it into the text area and select the Submit button.</u>. A TOTP is a Time-based One Time Password. Upon entering this page, nothing will happen. For now, we must open a terminal and traverse to `AccessControlProject/2ndFacter App/totp.js` and execute the totp.js file using the command: node totp.js. This will output a 6-digit code. Upon generating the code, you have a 30 second time limit to enter the code into the text area on the screen and hit the Submit button. Once the Submit button is clicked, it calls the `checkTOTP()` function in `common.js`, which does the exact same thing as `totp.js`. If all this was done in under 30 seconds, your manually-generated 6-digit code and the button-generated 6-digit code should be the same. The `/checkTOTP()` API Route in `server-user/backend-users/index.js` shuold simply check if the text area 6-digit code matches the one generated by the button. If they match, a status code 200 is sent back to `common.js`, in addition to a JSON Web Token in the form of a cookie, which expires in an hour. `common.js` then sends us to `query.html`. WARNING: SOMETIMES USING THE ARROW KEYS TO CALL A PREVIOUS EXECUTION OF `node totp.js` WILL RESULT IN AN ERROR. YOU MUST MANUALLY ENTER `node totp.js` FOR THIS TO WORK 
4. <u>Hit dat Query button</u> Hitting the query button will call the `query()` function in `common.js` which calls the `server-data/backend-data/index.js` file which contains the `/query` API Route. This API Route actually calls the `/validateToken` API Route in the other server: `server-user/backend-users/index.js`. But going back a bit, the `query()` function in `common.js` extracts the JWT from the cookie it was given by `checkTOTP()`, and then calls the `/query` API route to query the `things.sql` database, but only AFTER the `/query` API route calls the `server-user/backend-users/index.js`'s `/validateToken` API Route uses the fancy `JWT.verify()` function to confirm that the token contains the `JWTSECRET` environment variable and is still within the time limit from when the token was created. 

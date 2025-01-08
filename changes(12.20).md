# What's been changed: 

1. index.html
    - Removed `textarea` element that displays output from sql server.
2. common.js
    - Changed the mode in all functions' fetch requests to be the default mode: cors. This involved updating the packages.json file. This was changed because no-cors disabled the ability to send anything between common.js to index.js
    - Commented out the line: `else {
        //location.href = "http://" + parsedUrl.host + "/query.html";}` because we don't have a /query.html file
    - Removed the line:     `.then((resp) => resp.text())`. This allows the status codes instead of status text

3.  index.js
    - Added lines: `const cors = require("cors");`
                   `app.use(cors());`
                   To enable the use of cors dependency, allowing text to be passed between common.js and index.js (fixed not receiving any text) 
    - login()
      - Changed `let parsedBody = JSON.parse(request.body);` to `let parsedBody = request.body;`
      - Changed the SQL command from: `let SQL = "SELECT * FROM users WHERE username=" + parsedBody["username"];` to `let SQL = "SELECT * FROM users WHERE username = ?";`
        - The `?` allows for paramertization. Meaning we're a bit safer from SQL injection, and allows for the parameters from the `textarea` elements for username and password from index.js to be more dynamic instead of hard-coded
      - Added debugging lines:
          `console.log(results[0]["salt"])`
          `console.log(parsedBody["password"])`
          `console.log(PEPPER)`
          `console.log(combinedPass)`
          `console.log(results[0]["password"])`
          To verify the contents of the sever and the input into the password textarea element in index.html
      - Within the function: `bcrypt.compare()`
        - Corrected `if(error)` to `if(err)`
  4. tools/hashPassword.js
      - instead of the bcrypt generator website, using the file `hashPassword.js` allows us to:
         - know the salt being used
         - Generating a hashed password using the same parameters will generate a different hash EACH TIME it is encrypted. But bcrypt will be able to figure out the salt being used when looking at a hash. But because the bcrypt generator website doesn't tell us the exact salt, we have no way of reliably creating a hash that bcrypt can extract a salt from that matches our salt.
         - The instructions to install and run this file are commented within the file.
         - Because the file uses command-line parameters, we COULD use this file to dynamically create hashed passwords in the future. Although we probably need a secure way of generating and storing a random 4-digit hexcode for the salt in the future.

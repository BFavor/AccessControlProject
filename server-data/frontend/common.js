var parsedUrl = new URL(window.location.href);

// Assignment 0: Query the database to retrieve ALL of its contents.
// Called in: query.html 
// If Successful: Display all entries in a database   
function query() {
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
        headers: {
            "Authorization": JWT //token from cookie
        },
        mode: "no-cors",
    })
    .then((resp) => resp.text()) // query should NOT return resp.status code, but simply text! 
    .then((data) => {
        document.getElementById("response").innerHTML = data;
    })
    .catch((err) => {
        console.log(err);
    })
}

// Assignment 1: Login using username and password, check if both are in the database. If successfull, go to totp.html
// Called in: index.html
// If Successful: Go to totp.html
function login() {
    let body = JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    });
    console.log(body)
    // will have to watch 1/15 video to see if we changed the API route to include a port 
    fetch("http://" + parsedUrl.host + ":3000/login", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: body
    })
    .then((resp) => {
        if (resp.status = 500) {
            console.log("Server Error");
            alert("Server Error");
        }else if (resp.status = 401){
            console.log("Username or Password is Incorrect");
            alert("Username or Password is incorrect");
        }
        else if (resp.status = 415){
            console.log("Incomplete Request");
            alert("Incomplete Request!");
        
        }else {
            console.log("Successful Login");
            location.href = "http://" + parsedUrl.host + "/totp.html";
        }
    })
    .catch((err) => {
        console.log(err);
    })
}

// Assignment 2: Generate a TOTP on the server side automatically, and a user side manually. Compare the two TOTP's 
// Called in: totp.html
// If Successful: Go to query.html
function checkTOTP() {
    let stringifiedBody = JSON.stringify({
        totp: document.getElementById("totpCode").value
    });
    console.log(stringifiedBody)
    fetch("http://" + parsedUrl.host + ":3000/checkTOTP", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: stringifiedBody
    })
    .then((resp) => {
        if (resp.status == 200){
            console.log("TOTP Code Successful");
            // COLIN: ASSIGNMENT 3: 
            // add code here to receive a JWT from the /checkTOTP function in addition to a 200 status 
            // do something with JWT
            location.href = "http://" + parsedUrl.host + "/query.html";    
        }
        else if (resp.status = 500) {
            console.log("Server Error");
            alert("Server Error");
        }else if (resp.status = 401){
            console.log("TOTP Code Incorrect");
            alert("TOTP Code Incorrect");
        }else {
            console.log("Incomplete Request");
            alert("Incomplete Request");
        }
    })
    .catch((err) => {
        console.log(err);
    })
}


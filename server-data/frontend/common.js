var parsedUrl = new URL(window.location.href);

function query() {
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
        headers: {
            "Authoriztion": JWT //token from cookie
        },
        mode: "no-cors",
    })
    .then((resp) => resp.text())
    .then((data) => {
        document.getElementById("response").innerHTML = data;
    })
    .catch((err) => {
        console.log(err);
    })
}

function login() {
    let body = JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    });
    console.log(body)
    fetch("http://" + parsedUrl.host + ":8001/login", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: body
    })
    .then((resp) => resp.text())
    .then((resp) => {
        console.log("Successful Login");
        location.href = "http://" + parsedUrl.host + "/totp.html";
    })
    .catch((err) => {
        console.log(err);
        if (resp.status = 500) {
            console.log("Server Error");
            alert("Server Error");
        }else if (resp.status = 401){
            console.log("Username or Password is Incorrect");
            alert("Username or Password is incorrect");
        }else {
            console.log("Unknown Error");
            alert("Unknown Error");
        }
    })
}


function checkTOTP() {
    let stringifiedBody = JSON.stringify({
        totp: document.getElementById("totpCode").value
    });
    console.log(stringifiedBody)
    fetch("http://" + parsedUrl.host + ":8001/checkTOTP", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: stringifiedBody
    })
    .then((resp) => resp.text())
    .then((resp) => {
        console.log("TOTP Code Successful");
        // do something with JWT
        location.href = "http://" + parsedUrl.host + "/query.html";
    })
    .catch((err) => {
        console.log(err);
        if (resp.status = 500) {
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
}
var parsedUrl = new URL(window.location.href);

function query() {
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
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
    let stringifiedBody = JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    });

    
    fetch("http://" + parsedUrl.host + "/login", {
        method: "POST",
        // mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: stringifiedBody
    })
    .then((resp) => {
    if (resp.status == 500) {
        alert("Server Error");
    }
    else if (resp.status == 200){
        alert("Login Successful!")
    }
    else if (resp.status == 401){
        alert("Username or Password is incorrect");

    }
    })
    .catch((err) => {
        console.log(err);
    })
}
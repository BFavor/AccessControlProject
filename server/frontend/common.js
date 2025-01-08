var parsedUrl = new URL(window.location.href);

function query() {
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
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
        username: document.getElementById("username").text,
        password: document.getElementById("password").text
    });
    console.log(body)
    fetch("http://" + parsedUrl.host + "/login", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: body
    })
    .then((resp) => resp.text())
    .then((resp) => {
        document.href = query.html 
    })
    .catch((err) => {
        console.log(err);
     if (resp.status = 500) {
            alert("Server Error");
        }else if (resp.status = 401){
            alert("Username or Password is incorrect");
        }else {
            alert("Unknown Error");
        //}else {
        //location.href = "http://" + parsedUrl.host + "/query.html";
        }
    })
}
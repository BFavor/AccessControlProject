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
        window.location.href = "newpage.html";
    }
    else if (resp.status == 401){
        alert("Username or Password is incorrect");

    }
    })
    .catch((err) => {
        console.log(err);
    })
}


let serverTOTP = null; // Store server-generated TOTP
let backendTOTP = null;
function generateTOTP() {
    fetch("http://" + parsedUrl.host + "/generateTOTP", {
        method: "GET",
        mode: "cors",
    })
    .then((resp) => resp.text())
    .then((totp) => {
        serverTOTP = totp; // Store the TOTP for verification
        console.log("Server TOTP:", serverTOTP); // Debugging

        // Change the button and enable the text box for verification
        const button = document.querySelector(".button");
        button.textContent = "Verify TOTP";
        button.onclick = verifyTOTP;

        document.getElementById("input").disabled = false;
    })
    .catch((err) => {
        console.log("Error generating TOTP:", err);
    });
}

function generateTOTP2() {
    fetch("http://" + parsedUrl.host + "/generateTOTP2", {
        method: "GET",
        mode: "cors",
    })
    .then((resp) => resp.text())
    .then((totp) => {
        serverTOTP = totp; // Store the TOTP for verification
        console.log("Server TOTP:", serverTOTP); // Debugging

        // Change the button and enable the text box for verification
        const button = document.querySelector(".button");
        button.textContent = "Verify TOTP";
        button.onclick = verifyTOTP;

        document.getElementById("input").disabled = false;
    })
    .catch((err) => {
        console.log("Error generating TOTP:", err);
    });
}

function verifyTOTP() {
    const userTOTP = document.getElementById("input").value;

    if (!userTOTP) {
        alert("Please enter a TOTP.");
        return;
    }

    if (userTOTP === backendTOTP) {
        alert("TOTP verified successfully!");
    } else {
        alert("TOTP does not match. Please try again.");

        // Reset to the original state
        const button = document.querySelector(".button");
        button.textContent = "Generate TOTP";
        button.onclick = generateTOTP;

        document.getElementById("input").value = ""; // Clear the input field
        document.getElementById("input").disabled = true;
    }
}

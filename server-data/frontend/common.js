var parsedUrl = new URL(window.location.href);

//========================================================================================================
// index.html functions
//=========================================================================================================
document.addEventListener("DOMContentLoaded", function () {
    let hoverTimer;

    // Base64 Encoded Secret Message (Hidden from direct inspection)
    let encodedMessage = "VHJ5IHVzZXJuYW1lOiBhZG1pbiwgcGFzc3dvcmQ6IGFkbWluLg=="; 

    // Find the password label
    let passwordLabel = document.querySelector("label[for='password']");
    
    if (passwordLabel) {
        // Get the position of the password label
        let rect = passwordLabel.getBoundingClientRect();
        let colonX = rect.right + 2; // Position slightly after the text
        let colonY = rect.top + (rect.height / 4); // Adjust for alignment

        //  Dynamically create the hover zone at the colon's position
        let hoverArea = document.createElement('div');
        hoverArea.id = 'hover-area';
        hoverArea.style.position = "absolute";
        hoverArea.style.left = `${colonX-5}px`;
        hoverArea.style.top = `${colonY+3}px`;
        hoverArea.style.width = "2px"; // Small zone over the colon
        hoverArea.style.height = "8px";
        hoverArea.style.background = "transparent";
        hoverArea.style.cursor = "pointer";
        hoverArea.style.zIndex = "9999";
        document.body.appendChild(hoverArea);

        // Add hover functionality
        hoverArea.addEventListener('mouseenter', function () {
            hoverTimer = setTimeout(() => {
                let decodedMessage = atob(encodedMessage); // Decode Base64

                let secretMessage = document.createElement('div');
                secretMessage.id = "secret-message";
                secretMessage.innerText = decodedMessage;
                secretMessage.style.position = "absolute";
                secretMessage.style.top = `${rect.bottom + 5}px`; // Position below the colon
                secretMessage.style.left = `${colonX}px`;
                secretMessage.style.background = "black";
                secretMessage.style.color = "white";
                secretMessage.style.padding = "10px";
                secretMessage.style.borderRadius = "5px";
                secretMessage.style.zIndex = "9999";

                document.body.appendChild(secretMessage);
            }, 3000); // Delay before showing the secret message
        });

        hoverArea.addEventListener('mouseleave', function () {
            clearTimeout(hoverTimer);
            let secretMessage = document.getElementById("secret-message");
            if (secretMessage) {
                secretMessage.remove(); // Remove the message when no longer hovered
            }
        });
    } else {
        console.error("Password label not found.");
    }
});

// Function to toggle between login and signup forms
function toggleForms() {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const formTitle = document.getElementById("form-title");
    const toggleText = document.getElementById("toggle-text");

    if (loginForm.style.display === "none") {
        loginForm.style.display = "block";
        signupForm.style.display = "none";
        formTitle.innerText = "Login";
        toggleText.innerHTML = `Don't have an account? <a href="#" onclick="toggleForms()">Sign Up</a>`;
    } else {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
        formTitle.innerText = "Sign Up";
        toggleText.innerHTML = `Already have an account? <a href="#" onclick="toggleForms()">Login</a>`;
    }
} //   END OF toggleForms() function

// Function to handle signup
function signUp() {
    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!username || !email || !password || !confirmPassword) {
        alert("All fields are required!");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    console.log("JWT:",JWT);

    console.log("Sending signup request with:", { username, email, password });

    fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
    })
    .then((resp) => resp.json())
    .then((data) => {
        console.log("Signup response:", data);

        if (data.message === "User created successfully") {
            alert("Signup successful! Please log in.");
            toggleForms(); // Switch back to login form
        } else {
            alert(data.message);
        }
    })
    .catch((err) => {
        console.error("Error during signup:", err);
        alert("An error occurred. Please try again.");
    });
} //   END OF signUp() function

// Login function to handle authentication
function login() {
    // Retrieve the username and password from the textareas in index.html
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Debugging
    if (!username || !password) {
        alert("Please fill in both the username and password fields.");
        return;
    }

    // Create a JSON object with the username and password
    let body = JSON.stringify({ username, password });

    // Send a POST request to server-user/backend-users/index.js to authenticate the user
    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: body,
    })
    .then((resp) => {
        if (resp.status === 200) {
            return resp.text().then(() => {
                document.cookie = "username=" + username;
                document.body.classList.add("logged-in"); 
                console.log("Logged in:", username);
                location.href = "http://" + parsedUrl.host + "/totp.html";
            });
        } else if (resp.status === 401) {
            alert("Username or Password is incorrect");
        } else {
            alert("Server Error");
        }
    })
    .catch((err) => {
        console.log("Error during login:", err);
    });
} //  END OF login() function

// Initialize the index.html event listener
function initializeLoginPage() {
    const form = document.getElementById("login-page");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        login();
    });
} // END OF initializeLoginPage() function

// DOM event listener to check if the user is logged in, and to find the index.html
document.addEventListener("DOMContentLoaded", function () {
    
    const username = document.cookie
        .split("; ")
        .find((row) => row.startsWith("username="))?.split("=")[1];

    const currentPage = window.location.pathname.split("/").pop(); // Get the current file name

    // Ensure the sidebar is hidden on all pages except query.html
    if (currentPage === "query.html" && username) {
        document.body.classList.add("logged-in"); // Add the logged-in class to show the sidebar
    } else {
        document.body.classList.remove("logged-in"); // Hide the sidebar on other pages
    }

    if (document.getElementById("login-page")) {
        initializeLoginPage();
    }
}); // END OF DOM event listener for index.html


//========================================================================================================
// totp.html functions
//=========================================================================================================

// Function to generate a TOTP 
function checkTOTP() {


    const username = document.cookie
        .split("; ")
        .find((row) => row.startsWith("username="))?.split("=")[1];

    console.log("Retrieved username from cookie:", username);

    // Debugging
    if (!username) {
        alert("Username is missing! Please log in again.");
        return;
    }

    let stringifiedBody = JSON.stringify({
        totp: document.getElementById("totpCode").value,
        username: username,
    });

    // Send a POST request to server-user/backend-users/index.js to verify the TOTP
    // Send a POST request to server-user/backend-users/index.js to verify the TOTP
    fetch("http://" + parsedUrl.host + ":3000/checkTOTP", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: stringifiedBody,
    })
    .then((resp) => {
        if (resp.status === 200) {
            return resp.text().then((token) => {
                document.cookie = `JWT=${token}`; 
                console.log("JWT Cookie set:", document.cookie); 
                location.href = "http://" + parsedUrl.host + "/query.html";
            });
        } else if (resp.status === 401) {
            alert("TOTP Code Incorrect");
        } else {
            alert("Server Error");
        }
    })
    .catch((err) => {
        console.log(err);
    });
}//   END OF checkTOTP() function

// DOM event listener to check if the user is logged in, and to find the totp.html
document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the text from the textarea
    const totpTextarea = document.getElementById("totpCode");
    const totpButton = document.getElementById("totp-button");

    // Prevent Enter from adding new lines in the textarea
    if (totpTextarea) {
        totpTextarea.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent new line
                if (totpButton.innerText === "Submit TOTP") {
                    checkTOTP(); // Call the function to submit TOTP
                }
            }
        });
    }

    // Handle button text and behavior
    if (totpButton) {
        totpButton.addEventListener("click", function () {
            if (totpButton.innerText === "Generate TOTP") {
                totpButton.innerText = "Submit TOTP";
                alert("TOTP has been generated! Please enter it below.");
            } else if (totpButton.innerText === "Submit TOTP") {
                checkTOTP(); 
            }
        });
    }
});

//========================================================================================================
// query.html functions
//========================================================================================================


// Sidebar toggle function
const toggleSidebar = () => {
    document.body.classList.toggle("open");
};

// Function to query the things database
function query() {
    // Extract the JWT token from the cookie which is generated by checkTOTP() and stored in browser
    const JWT = document.cookie
        .split("; ")
        .find((row) => row.startsWith("JWT="))?.split("=")[1];
    console.log("JWT:",JWT);
    
    // Debugging
    if (!JWT) {
        alert("JWT token is missing! Please log in again.");
        return;
    }

    // Fetch the data from the things database
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
        headers: {
            "Authorization": JWT, 
        },
    })
    .then((resp) => resp.text()) // the API Route will only return text 
    .then((data) => {

        if (resp.status === 403) {
            alert("Access forbidden: Only Lame-o's can query this data.");
            return; // Exit the function for Admin users
        }

        document.getElementById("response").innerHTML = data;
    })
    .catch((err) => {
        alert("An error occurred while querying the database.");
    });
} //    END OF query() function

function query2() {
    const JWT = document.cookie
        .split("; ")
        .find((row) => row.startsWith("JWT="))?.split("=")[1];
    
    if (!JWT) {
        alert("JWT token is missing! Please log in again.");
        return;
    }
    console.log("JWT:",JWT);

    fetch("http://" + parsedUrl.host + "/validate-and-update-user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: JWT }),
    })
    .then((resp) => {
        if (!resp.ok) {
            throw new Error("Failed to validate user");
        }
        return resp.json();
    })
    .then((data) => {
        if (!data.payload || !data.payload.role) {
            throw new Error("Invalid response from server: Missing payload or role");
        }
        const { role } = data.payload;
        
        console.log("User role:", role);

        if (role !== "Mid") {
            alert("Access forbidden: Only Mids can query this data.");
            return; // Exit the function for Admin users
        }

        // Fetch the contents of the things2 database
        return fetch("http://" + parsedUrl.host + "/query2", {
            method: "GET",
            headers: {
                "Authorization": JWT,
            },
        });
    })
    .then((resp) => {
        console.log("Response2:", resp);
        if (!resp) return; // If the user is an Admin, the function stops here
        return resp.json();
    })
    .then((results) => {
        const responseTextarea = document.getElementById("response");
        if (responseTextarea) {
            responseTextarea.value = JSON.stringify(results, null, 2); // Pretty-print JSON results
        }
    })
    .catch((err) => {
        console.error("Error during query2 execution:", err);
        alert("An error occurred while executing the query.");
    });
} //    END OF query2() function

// Toggle Dark mode and Light mode
function toggleTheme() {
    const root = document.documentElement;
    const homeIcon = document.querySelector(".sidebar-menu button:first-of-type > i");

    const JWT = document.cookie
        .split("; ")
        .find((row) => row.startsWith("JWT="))?.split("=")[1];

    if (!JWT) {
        alert("JWT token is missing! Please log in again.");
        return;
    }

    let newTheme;

    // Toggle the theme
    if (root.classList.contains("light-mode")) {
        root.classList.remove("light-mode");
        newTheme = "dark";

        // Update the icon to a sun
        if (homeIcon) {
            homeIcon.classList.remove("bx-moon");
            homeIcon.classList.add("bx-sun");
        }
    } else {
        root.classList.add("light-mode");
        newTheme = "light";

        // Update the icon to a moon
        if (homeIcon) {
            homeIcon.classList.remove("bx-sun");
            homeIcon.classList.add("bx-moon");
        }
    }

    // Send the updated theme to the server
    fetch("http://" + parsedUrl.host + "/change-theme", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: JWT, theme: newTheme }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to update theme preference");
            }
            return response.json();
        })
        .then((data) => {
            console.log("Theme updated successfully:", data.message);
        })
        .catch((err) => {
            console.error("Error updating theme preference:", err);
            alert("Failed to update theme preference");
        });
} //  END OF toggleTheme() function


// Add event listener to the Home button for toggling theme
document.addEventListener("DOMContentLoaded", function () {
    const homeButton = document.querySelector(".sidebar-menu button:first-of-type");
    if (homeButton) {
        homeButton.addEventListener("click", toggleTheme);
    }
}); // END OF DOM event listener for query.html



function moveToLogs() {
    const JWT = document.cookie
        .split("; ")
        .find((row) => row.startsWith("JWT="))?.split("=")[1];

    if (!JWT) {
        alert("You are not logged in.");
        return;
    }

    fetch("http://localhost:3000/validateToken", {
        method: "POST",
        headers: { "Authorization": JWT }
    })
    .then(resp => {
        if (resp.status !== 200) throw new Error("Token invalid");
        return resp.json();
    })
    .then(data => {
        const { username, role } = data.payload;

        if (role !== "Admin") {
            alert("Access denied: Admins only.");
            logAction(username, "Attempted to access logs from query.html", "Failure"); // Log unauthorized attempt
            return;
        }

        location.href = "http://" + window.location.host + "/logs.html";
    })
    .catch(err => {
        console.error("Error validating token:", err.message);
        alert("Failed to verify access.");
    });
}


function fetchLogs() {
    const JWT = document.cookie
        .split("; ")
        .find((row) => row.startsWith("JWT="))?.split("=")[1];

    if (!JWT) {
        alert("You are not logged in.");
        return;
    }

    fetch("http://localhost:3000/validateToken", {
        method: "POST",
        headers: { "Authorization": JWT }
    })
    .then(resp => {
        if (resp.status !== 200) throw new Error("Token invalid");
        return resp.json();
    })
    .then(data => {
        const { username, role } = data.payload;

        if (role !== "Admin") {
            alert("Access denied: Admins only.");
            logAction(username, "Attempted to fetch logs from logs.html", "Failure"); // Log unauthorized attempt
            return;
        }

        // Proceed with fetching logs if user is an Admin
        const filter = document.getElementById("filter").value;
        const logsOutput = document.getElementById("logs-output");
        logsOutput.value = "Fetching logs...\n";

        fetch("http://localhost:3000/get-logs", {
            method: "GET",
            headers: { "Authorization": JWT }
        })
        .then((resp) => {
            if (resp.status === 403) {
                alert("Access denied: Admins only.");
                logsOutput.value = "Access denied.";
                return [];
            }
            return resp.json();
        })
        .then((logs) => {
            if (filter !== "all") {
                logs = logs.filter(log => log.status === filter);
            }

            if (logs.length === 0) {
                logsOutput.value = "No logs found.";
                return;
            }

            logsOutput.value = logs.map(log => 
                `ID: ${log.id}\nUsername: ${log.username}\nTimestamp: ${new Date(log.timestamp).toLocaleString()}\nData Accessed: ${log.data_accessed}\nStatus: ${log.status}\n---\n`
            ).join("");
        })
        .catch((err) => {
            console.error("Error retrieving logs:", err);
            logsOutput.value = "Failed to fetch logs.";
        });
    })
    .catch(err => {
        console.error("Error validating token:", err.message);
        alert("Failed to verify access.");
    });
}
function clearLogs() {
    document.getElementById("logs-output").value = "";
}




const crypto = require("crypto");

function generateTOTP() {
    const SECRET = process.env.SECRET; // Use a default if SECRET is undefined
    const time = Math.floor(Date.now() / 30000); // 30-second interval
    const hash = crypto.createHmac("sha256", SECRET).update(String(time)).digest("hex");
    const totp = hash.match(/\d/g).join("").slice(0, 6); // First 6 numeric digits
    return totp; // Return the TOTP instead of directly logging it
}

// Export the function so it can be used in other files
module.exports = generateTOTP;

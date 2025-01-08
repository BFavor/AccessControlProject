/*
Desc: 
    Step 1. Within a separate folder* , run the command: "npm install bcrypt". This will generate a node_modules folder, package-lock.json file, and a package.json file
    Step 2. Given the salt, password, pepper, and an optional parameter of saltRounds which defaults to the number 10, run the hashPassword.js file
    
    Example Execution: node hashPassword.js salt pass pepper rounds 
    Example Execution: node hashPassword.js 90bb user ef79 

    Footnote*: you don't have to create a separate folder to put this file into and then run the following commands, but it will prevent the generation of .json files and a big folder from being in the same directory as the server files 
*/


const bcrypt = require("bcrypt");

// Retrieve command-line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
    console.error("Usage: node hashPassword.js <salt> <password> <pepper> [rounds]");
    process.exit(1);
}

const salt = args[0]; // First argument: salt
const password = args[1]; // Second argument: password
const pepper = args[2];   // Third argument: pepper
const saltRounds = args[3] ? parseInt(args[3], 10) : 10; // Fourth argument (optional): rounds, default to 10

if (isNaN(saltRounds)) {
    console.error("Error: rounds must be a valid number.");
    process.exit(1);
}

/**
 * Hash a password with a custom salt, pepper, and cost factor.
 * 
 * @param {string} password - The plaintext password to hash.
 * @param {string} salt - A custom salt to use.
 * @param {number} rounds - The number of rounds for bcrypt hashing.
 * @param {string} pepper - A global secret added to the password.
 * @returns {Promise<string>} The resulting bcrypt hash.
 */
async function hashPassword(salt, password, pepper, rounds) {
    try {
        // Combine the salt, password, and pepper
        const combinedPass = salt + password + pepper;

        // Generate the bcrypt hash
        const hashedPassword = await bcrypt.hash(combinedPass, rounds);

        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw error;
    }
}

// Main execution
// Example generation of hashed password: 
// node hashPassword.js salt pass pepper 2
// node hashPassword.js salt pass pepper 
(async () => {
    try {
        console.log("Salt:", salt);
        console.log("Plaintext Password:", password);
        console.log("Pepper:", pepper);
        console.log("Rounds:", saltRounds);

        const hashedPassword = await hashPassword(salt, password, pepper, saltRounds);
        console.log("Hashed Password:", hashedPassword);
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
})();

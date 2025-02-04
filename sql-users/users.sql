CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    role ENUM('Default','Admin') NOT NULL,
    PRIMARY KEY (username)
);

INSERT INTO users
VALUES(
    "user",
    "$2a$04$/jeENqlGeTEkYbhq2l7NWOKSwahliz5jekotuZiXEnVCtkhn5WOTG", 
    "3eb7",
    "user@example.com",
    "Default"
);

CREATE TABLE logs (
    id BINARY(16) DEFAULT (UUID_TO_BIN(UUID(), 1)) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_accessed VARCHAR(255) NOT NULL,
    status ENUM('Success', 'Failure') NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

/*

Right now the sudo docker compose down --volumes --remove-orphans 

command removes the state in which the database is created and the data is inserted and saved.
So the data is lost and the database is empty again.

INSERT INTO users (username, password, salt, email, role) 
VALUES
    ("KelpMeFindLove", "hashed_password_1", "salt1", "kelpmeout@seamail.com", "Default"),
    ("SeaweedAndChill", "hashed_password_2", "salt2", "brackishharmony@tide.com", "Default"),
    ("Phycologist4U", "hashed_password_3", "salt3", "seaweedbae@algae.net", "Default"),
    ("AlgaeBae", "hashed_password_4", "salt4", "plankton4two@microdate.org", "Default"),
    ("Cyanosingle", "hashed_password_5", "salt5", "cyanolover@bloom.com", "Default"),
    ("MatchaMadeInHeaven", "hashed_password_6", "salt6", "diatomdude@oceanmail.com", "Default"),
    ("HotMicrobeAction", "hashed_password_7", "salt7", "greenflagnotredflag@matcha.net", "Default"),
    ("BrackishRomance", "hashed_password_8", "salt8", "kelpmefindlove@wavy.com", "Default"),
    ("SlimyYetSeductive", "hashed_password_9", "salt9", "chlorophyll4u@photosynth.date", "Default"),
    ("DiatomDaddy", "hashed_password_10", "salt10", "slimeybutfine@seaweedmatch.com", "Default");
*/
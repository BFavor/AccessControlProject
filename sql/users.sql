CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);

INSERT INTO users
VALUES(
    "user",
    "$2a$04$hGF9F34HuMBHhM.7iOQoAOfHY3fIK7b0SX1UbHEcM9xzzG9O1QZWa", 
    "3eb7",
    "user@example.com"
);

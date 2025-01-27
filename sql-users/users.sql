CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    role ENUM('Lame-o','Mid','Admin') NOT NULL,
    PRIMARY KEY (username)
);

INSERT INTO users
VALUES(
    "user",
    "$2a$04$/jeENqlGeTEkYbhq2l7NWOKSwahliz5jekotuZiXEnVCtkhn5WOTG", 
    "3eb7",
    "user@example.com",
    "Mid"
);

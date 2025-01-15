CREATE DATABASE things;

use things;

CREATE TABLE things (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);

INSERT INTO things
VALUES(
    "user",
    "$2a$04$/jeENqlGeTEkYbhq2l7NWOKSwahliz5jekotuZiXEnVCtkhn5WOTG", 
    "3eb7",
    "user@example.com"
);

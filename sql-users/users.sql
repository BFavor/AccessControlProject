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
    "Lame-o"
);

INSERT INTO users
VALUES(
    "mid",
    "$2a$04$7dCJicxwAlJcD0tplhsq7eLQr6ZfA.uhBNZtT1oqXo5HUHAO3A1qW",
    "6eb7",
    "mid@random.com",
    "Mid"
);

INSERT INTO users
VALUES(
    "admin",
    "$2a$04$YiFe4FbdEFI5PwajEQMJceSnfMY0XacZwAE/riFURR3E28nayILxu",
    "c3af",
    "admin@random.com",
    "Admin"
);

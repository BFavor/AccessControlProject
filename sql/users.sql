CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);

INSERT INTO users (username,password,salt,email)
VALUES(
    "user",
    "$2b$10$bD0htq6IzetE4JDVJ6xGTuTD8ypVg/gWWAdpOfy0VtSMKQRlBXIPq", 
    "90bb",
    "user@example.com"
);

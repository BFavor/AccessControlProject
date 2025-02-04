CREATE DATABASE things;

use things;
-- FILL A TABLE WITH ALGAE
CREATE TABLE things1 (
    algae VARCHAR(255) NOT NULL,
    PRIMARY KEY (algae)
);

INSERT INTO things1
VALUES(
    "isKing"
);

CREATE TABLE things2 (
    username VARCHAR(255) NOT NULL PRIMARY KEY,
    theme_preference VARCHAR(10) DEFAULT 'dark'
);

CREATE DATABASE things;

use things;

CREATE TABLE things1 (
    algae VARCHAR(255) NOT NULL,
    PRIMARY KEY (algae)
);

INSERT INTO things1
VALUES(
    "isKing"
);

CREATE TABLE things2 (
    member VARCHAR(255) NOT NULL,
    PRIMARY KEY (member)
);

INSERT INTO things2
VALUES(
    "one"
);
CREATE DATABASE things;
USE things;

-- Existing tables
CREATE TABLE things1 (
    algae VARCHAR(255) NOT NULL,
    info  VARCHAR(255) NOT NULL,
    PRIMARY KEY (algae)
);

INSERT INTO things1 VALUES("isKing", "algae != colons");

CREATE TABLE things2 (
    username VARCHAR(255) NOT NULL PRIMARY KEY,
    theme_preference VARCHAR(10) DEFAULT 'dark'
);

INSERT INTO things2 VALUES("user","dark");

-- New user_profiles table
CREATE TABLE user_profiles (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT, 
    algae_facts TEXT,
    profile_picture VARCHAR(500),
    FOREIGN KEY (username) REFERENCES things2(username) ON DELETE CASCADE
);

-- New messages table
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_username VARCHAR(255) NOT NULL,
    receiver_username VARCHAR(255) NOT NULL,
    message_text TEXT,
    image_path VARCHAR(500),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_username) REFERENCES things2(username) ON DELETE CASCADE,
    FOREIGN KEY (receiver_username) REFERENCES things2(username) ON DELETE CASCADE
);

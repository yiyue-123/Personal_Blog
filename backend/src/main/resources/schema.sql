CREATE DATABASE IF NOT EXISTS personal_blog;

USE personal_blog;

CREATE TABLE IF NOT EXISTS t_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NULL,
    avatar VARCHAR(255) NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    status TINYINT NOT NULL DEFAULT 1,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_user_register_application (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NULL,
    avatar VARCHAR(255) NULL,
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0待审批 1已通过 2已拒绝',
    review_reason VARCHAR(255) NULL,
    review_by BIGINT NULL,
    review_time DATETIME NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username_status (username, status),
    INDEX idx_status_create (status, create_time)
);

CREATE TABLE IF NOT EXISTS t_article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content MEDIUMTEXT NOT NULL,
    summary VARCHAR(500) NULL,
    category_id BIGINT NULL,
    user_id BIGINT NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    view_count INT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category_id),
    INDEX idx_user (user_id),
    INDEX idx_status_create (status, create_time)
);

CREATE TABLE IF NOT EXISTS t_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    article_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT NULL,
    content TEXT NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_article (article_id, create_time),
    INDEX idx_parent (parent_id)
);

CREATE TABLE IF NOT EXISTS t_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS t_article_tag (
    article_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS t_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    sort INT NOT NULL DEFAULT 0
);

INSERT INTO t_category (name, sort)
SELECT 'Java', 1
WHERE NOT EXISTS (SELECT 1 FROM t_category WHERE name = 'Java');

INSERT INTO t_category (name, sort)
SELECT 'Spring Boot', 2
WHERE NOT EXISTS (SELECT 1 FROM t_category WHERE name = 'Spring Boot');

INSERT INTO t_category (name, sort)
SELECT 'Database', 3
WHERE NOT EXISTS (SELECT 1 FROM t_category WHERE name = 'Database');

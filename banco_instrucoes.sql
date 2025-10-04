CREATE DATABASE nodesequelize
CHARACTER
SET utf8mb4
COLLATE utf8mb4_unicode_ci;
USE nodesequelize;

-- =============================================================
-- users
-- =============================================================
CREATE TABLE `users`
(
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR
(100) NOT NULL,
  `occupation` VARCHAR
(150) DEFAULT NULL,
  `newsletter` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY
(`id`),
  KEY `idx_users_name`
(`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- addresses
-- =============================================================
CREATE TABLE `addresses`
(
  `id` INT NOT NULL AUTO_INCREMENT,
  `street` VARCHAR
(200) NOT NULL,
  `number` VARCHAR
(20) DEFAULT NULL,
  `city` VARCHAR
(100) NOT NULL,
  `userId` INT DEFAULT NULL,
  PRIMARY KEY
(`id`),
  KEY `idx_addresses_userId`
(`userId`),
  CONSTRAINT `fk_addresses_user`
    FOREIGN KEY
(`userId`) REFERENCES `users`
(`id`)
    ON
DELETE CASCADE
    ON
UPDATE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- inserções de exemplo
-- =============================================================
INSERT INTO `users` (`
name`,
`occupation
`, `newsletter`)
VALUES
('Carlos Souza', 'Desenvolvedor', TRUE),
('Ana Oliveira', 'Professora', FALSE);

INSERT INTO `addresses` (`
street`,
`number
`, `city`, `userId`)
VALUES
('Rua das Palmeiras', '45A', 'São Paulo', 1),
('Avenida Brasil', '1200', 'Rio de Janeiro', 2);

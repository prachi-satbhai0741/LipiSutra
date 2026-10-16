CREATE DATABASE IF NOT EXISTS lipisutra
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lipisutra;

CREATE TABLE IF NOT EXISTS manuscripts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  accession   VARCHAR(12)  NOT NULL UNIQUE,
  title       VARCHAR(120) NOT NULL,
  script      ENUM('Modi','Devanagari','Brahmi','Sharada') NOT NULL,
  era_year    INT          NOT NULL,
  confidence  DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  status      ENUM('pending','verified') NOT NULL DEFAULT 'pending',
  transcript  TEXT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO manuscripts (accession, title, script, era_year, confidence, status, transcript)
VALUES
 ('LS-0101','Modi Land Grant','Modi',1712,92.50,'verified','...'),
 ('LS-0102','Devanagari Verse Folio','Devanagari',1588,87.00,'verified','...'),
 ('LS-0103','Brahmi Rock Inscription','Brahmi',-230,71.25,'pending','...');

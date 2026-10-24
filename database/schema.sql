-- ============================================================
--  STAYCLOSE — Database schema (MySQL 8 / MariaDB 10.5+)
--  Smart Pet Hotel CCTV Monitoring Platform
--
--  Import:  mysql -u root -p < database/schema.sql
--           mysql -u root -p stayclose < database/seed.sql
--  (or paste both files into phpMyAdmin > SQL)
--
--  The front-end (js/db.js) stores the same tables in the
--  browser's localStorage so the site runs without a server.
-- ============================================================

CREATE DATABASE IF NOT EXISTS stayclose CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stayclose;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS payments, password_resets, user_settings, messages, notifications,
  activities, cameras, booking_pets, bookings, room_types, hotels, pets, users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------- users (pet owners, hotel staff, admins) ----------
CREATE TABLE users (
  id            VARCHAR(40)  PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  first_name    VARCHAR(60)  NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  phone         VARCHAR(30),
  address       VARCHAR(255),
  avatar        VARCHAR(16)  DEFAULT '🙂',
  role          ENUM('owner','staff','admin') NOT NULL DEFAULT 'owner',
  salt          VARCHAR(64)  NOT NULL,
  -- demo uses SHA-256(salt + ':' + password); use bcrypt/argon2 in production
  password_hash VARCHAR(255) NOT NULL,
  last_login    DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- pets ----------
CREATE TABLE pets (
  id         VARCHAR(40) PRIMARY KEY,
  user_id    VARCHAR(40) NOT NULL,
  name       VARCHAR(60) NOT NULL,
  species    ENUM('Dog','Cat','Rabbit','Bird','Other') NOT NULL DEFAULT 'Dog',
  breed      VARCHAR(80),
  age        DECIMAL(4,1),
  gender     ENUM('Male','Female'),
  weight     DECIMAL(5,2),
  emoji      VARCHAR(16),
  color      VARCHAR(120),
  notes      TEXT,
  status     VARCHAR(40) NOT NULL DEFAULT 'At home',
  mood       VARCHAR(60),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pets_user (user_id)
) ENGINE=InnoDB;

-- ---------- hotels ----------
CREATE TABLE hotels (
  id         VARCHAR(40) PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  address    VARCHAR(255) NOT NULL,
  city       VARCHAR(60)  NOT NULL,
  rating     DECIMAL(2,1) NOT NULL DEFAULT 0,
  reviews    INT NOT NULL DEFAULT 0,
  price      INT NOT NULL COMMENT 'base price per night in IDR',
  tint       VARCHAR(10),
  amenities  JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hotels_city (city)
) ENGINE=InnoDB;

CREATE TABLE room_types (
  id         VARCHAR(20) PRIMARY KEY,
  name       VARCHAR(60) NOT NULL,
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00
) ENGINE=InnoDB;

-- ---------- bookings ----------
CREATE TABLE bookings (
  id         VARCHAR(40) PRIMARY KEY,
  user_id    VARCHAR(40) NOT NULL,
  hotel_id   VARCHAR(40) NOT NULL,
  code       VARCHAR(20) NOT NULL UNIQUE,
  room_type  VARCHAR(20) NOT NULL,
  check_in   DATE NOT NULL,
  check_out  DATE NOT NULL,
  status     ENUM('upcoming','active','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  promo_code VARCHAR(20),
  total      INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bk_user  FOREIGN KEY (user_id)   REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_bk_hotel FOREIGN KEY (hotel_id)  REFERENCES hotels(id),
  CONSTRAINT fk_bk_room  FOREIGN KEY (room_type) REFERENCES room_types(id),
  CONSTRAINT chk_bk_dates CHECK (check_out > check_in),
  INDEX idx_bk_user_status (user_id, status)
) ENGINE=InnoDB;

CREATE TABLE booking_pets (
  id         VARCHAR(40) PRIMARY KEY,
  booking_id VARCHAR(40) NOT NULL,
  pet_id     VARCHAR(40) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_booking_pet (booking_id, pet_id),
  CONSTRAINT fk_bp_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_bp_pet     FOREIGN KEY (pet_id)     REFERENCES pets(id)     ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE payments (
  id         VARCHAR(40) PRIMARY KEY,
  booking_id VARCHAR(40) NOT NULL,
  method     ENUM('card','bank','ewallet','qris') NOT NULL,
  amount     INT NOT NULL,
  status     ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  paid_at    DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- CCTV cameras ----------
CREATE TABLE cameras (
  id         VARCHAR(40) PRIMARY KEY,
  hotel_id   VARCHAR(40) NOT NULL,
  name       VARCHAR(60) NOT NULL,
  scene      VARCHAR(20) NOT NULL COMMENT 'play | nap | dining | garden | lounge',
  stream_url VARCHAR(255) COMMENT 'HLS / WebRTC URL of the real camera',
  status     ENUM('live','offline','maintenance') NOT NULL DEFAULT 'live',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cam_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- activity log (feeds the Activity Report) ----------
CREATE TABLE activities (
  id          VARCHAR(40) PRIMARY KEY,
  pet_id      VARCHAR(40) NOT NULL,
  booking_id  VARCHAR(40),
  type        ENUM('meal','play','sleep','walk','snack','rest','medical') NOT NULL,
  title       VARCHAR(120) NOT NULL,
  description VARCHAR(255),
  location    VARCHAR(60),
  occurred_at DATETIME NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_act_pet     FOREIGN KEY (pet_id)     REFERENCES pets(id)     ON DELETE CASCADE,
  CONSTRAINT fk_act_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_act_pet_time (pet_id, occurred_at)
) ENGINE=InnoDB;

-- ---------- notifications ----------
CREATE TABLE notifications (
  id         VARCHAR(40) PRIMARY KEY,
  user_id    VARCHAR(40) NOT NULL,
  pet_id     VARCHAR(40),
  type       ENUM('alert','update','promo') NOT NULL DEFAULT 'update',
  title      VARCHAR(160) NOT NULL,
  body       VARCHAR(255),
  detail     TEXT,
  location   VARCHAR(120),
  `read`     BOOLEAN NOT NULL DEFAULT FALSE,
  at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_n_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_n_pet  FOREIGN KEY (pet_id)  REFERENCES pets(id)  ON DELETE SET NULL,
  INDEX idx_n_user (user_id, `read`, at)
) ENGINE=InnoDB;

-- ---------- chat support ----------
CREATE TABLE messages (
  id         VARCHAR(40) PRIMARY KEY,
  user_id    VARCHAR(40) NOT NULL,
  hotel_id   VARCHAR(40),
  sender     ENUM('user','staff') NOT NULL,
  body       TEXT,
  attachment VARCHAR(255),
  at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_m_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_m_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL,
  INDEX idx_m_user (user_id, at)
) ENGINE=InnoDB;

-- ---------- settings & auth helpers ----------
CREATE TABLE user_settings (
  id             VARCHAR(48) PRIMARY KEY,
  user_id        VARCHAR(40) NOT NULL UNIQUE,
  theme          ENUM('light','dark') NOT NULL DEFAULT 'light',
  language       VARCHAR(5) NOT NULL DEFAULT 'en',
  notify_push    BOOLEAN NOT NULL DEFAULT TRUE,
  notify_email   BOOLEAN NOT NULL DEFAULT TRUE,
  notify_alerts  BOOLEAN NOT NULL DEFAULT TRUE,
  notify_promos  BOOLEAN NOT NULL DEFAULT FALSE,
  reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
  paw_trail      BOOLEAN NOT NULL DEFAULT TRUE,
  two_factor     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_set_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE password_resets (
  id         VARCHAR(40) PRIMARY KEY,
  user_id    VARCHAR(40) NOT NULL,
  code       CHAR(4) NOT NULL COMMENT 'store a hash of the code in production',
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- handy views ----------
CREATE OR REPLACE VIEW v_active_stays AS
SELECT b.id AS booking_id, b.code, u.name AS owner, h.name AS hotel, p.name AS pet,
       b.check_in, b.check_out
FROM bookings b
JOIN users u        ON u.id = b.user_id
JOIN hotels h       ON h.id = b.hotel_id
JOIN booking_pets bp ON bp.booking_id = b.id
JOIN pets p         ON p.id = bp.pet_id
WHERE b.status = 'active';

CREATE OR REPLACE VIEW v_daily_report AS
SELECT pet_id, DATE(occurred_at) AS day,
       SUM(type IN ('meal','snack')) AS meals,
       SUM(type = 'play')  AS play_sessions,
       SUM(type = 'sleep') AS naps,
       COUNT(*)            AS total_events
FROM activities
GROUP BY pet_id, DATE(occurred_at);

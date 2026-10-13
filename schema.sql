-- ============================================================================
-- Database Schema: Concert Setlist & Tour Archive
-- Database Engine: MySQL 8.0+
-- Description: Full DDL for managing artists, tours, concerts, songs, and setlists.
-- Includes schema tables, foreign key constraints, indexes, and views.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS concert_archive;
USE concert_archive;

-- Disable FK checks for clean script execution / drops
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS SongPerformanceHistory;
DROP VIEW IF EXISTS ConcertSetlistView;

DROP TABLE IF EXISTS Setlists;
DROP TABLE IF EXISTS Songs;
DROP TABLE IF EXISTS Concerts;
DROP TABLE IF EXISTS Tours;
DROP TABLE IF EXISTS Artists;
DROP TABLE IF EXISTS Admins;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. Artists Table
-- Stores information about music artists, bands, or performers.
-- ----------------------------------------------------------------------------
CREATE TABLE Artists (
    Artist_ID INT AUTO_INCREMENT PRIMARY KEY,
    Artist_Name VARCHAR(100) NOT NULL,
    Genre VARCHAR(50) NOT NULL,
    Country VARCHAR(60) NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_artist_name (Artist_Name),
    INDEX idx_artist_genre (Genre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores music artists and performers information';

-- ----------------------------------------------------------------------------
-- 2. Tours Table
-- Tracks concert tours organized by artists with start and end dates.
-- ----------------------------------------------------------------------------
CREATE TABLE Tours (
    Tour_ID INT AUTO_INCREMENT PRIMARY KEY,
    Artist_ID INT NOT NULL,
    Tour_Name VARCHAR(150) NOT NULL,
    Start_Date DATE NOT NULL,
    End_Date DATE NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tours_artist 
        FOREIGN KEY (Artist_ID) REFERENCES Artists(Artist_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_tour_dates 
        CHECK (End_Date >= Start_Date),
    INDEX idx_tour_artist (Artist_ID),
    INDEX idx_tour_dates (Start_Date, End_Date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores tour schedules associated with artists';

-- ----------------------------------------------------------------------------
-- 3. Concerts Table
-- Represents individual concert events taking place as part of a tour.
-- ----------------------------------------------------------------------------
CREATE TABLE Concerts (
    Concert_ID INT AUTO_INCREMENT PRIMARY KEY,
    Tour_ID INT NOT NULL,
    Concert_Date DATE NOT NULL,
    Venue VARCHAR(150) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_concerts_tour 
        FOREIGN KEY (Tour_ID) REFERENCES Tours(Tour_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_concert_tour (Tour_ID),
    INDEX idx_concert_date (Concert_Date),
    INDEX idx_concert_city (City)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores individual concert event locations and dates';

-- ----------------------------------------------------------------------------
-- 4. Songs Table
-- Contains details of songs belonging to artists.
-- ----------------------------------------------------------------------------
CREATE TABLE Songs (
    Song_ID INT AUTO_INCREMENT PRIMARY KEY,
    Artist_ID INT NOT NULL,
    Song_Name VARCHAR(150) NOT NULL,
    Album VARCHAR(150) NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_songs_artist 
        FOREIGN KEY (Artist_ID) REFERENCES Artists(Artist_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_songs_artist (Artist_ID),
    INDEX idx_song_name (Song_Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores songs produced by artists';

-- ----------------------------------------------------------------------------
-- 5. Setlists Table
-- Junction table mapping songs performed at specific concerts with order.
-- ----------------------------------------------------------------------------
CREATE TABLE Setlists (
    Concert_ID INT NOT NULL,
    Song_ID INT NOT NULL,
    Song_Order INT NOT NULL,
    PRIMARY KEY (Concert_ID, Song_ID),
    CONSTRAINT fk_setlists_concert 
        FOREIGN KEY (Concert_ID) REFERENCES Concerts(Concert_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_setlists_song 
        FOREIGN KEY (Song_ID) REFERENCES Songs(Song_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_concert_song_order 
        UNIQUE (Concert_ID, Song_Order),
    CONSTRAINT chk_song_order_positive 
        CHECK (Song_Order > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps songs played during each concert in specific order';

-- ----------------------------------------------------------------------------
-- 6. Admins Table
-- Stores authorized administrative users for managing archive data.
-- ----------------------------------------------------------------------------
CREATE TABLE Admins (
    Admin_ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Full_Name VARCHAR(100) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'Super Admin',
    Last_Login TIMESTAMP NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_username (Username),
    INDEX idx_admin_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores administrative user accounts and clearance credentials';

-- ============================================================================
-- VIEWS DEFINITION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View 1: ConcertSetlistView
-- Combines concert information, tour details, artist details, and ordered setlist songs.
-- Useful for displaying full concert setlists on the web dashboard.
-- ----------------------------------------------------------------------------
CREATE VIEW ConcertSetlistView AS
SELECT 
    c.Concert_ID,
    c.Concert_Date,
    c.Venue,
    c.City,
    t.Tour_ID,
    t.Tour_Name,
    a.Artist_ID,
    a.Artist_Name,
    a.Genre,
    s.Song_ID,
    s.Song_Name,
    s.Album,
    sl.Song_Order
FROM Setlists sl
JOIN Concerts c ON sl.Concert_ID = c.Concert_ID
JOIN Tours t ON c.Tour_ID = t.Tour_ID
JOIN Artists a ON t.Artist_ID = a.Artist_ID
JOIN Songs s ON sl.Song_ID = s.Song_ID
ORDER BY c.Concert_ID, sl.Song_Order;

-- ----------------------------------------------------------------------------
-- View 2: SongPerformanceHistory
-- Aggregates performance statistics for each song across all concerts.
-- Summarizes total performances, date first played, date last played, and average order position.
-- ----------------------------------------------------------------------------
CREATE VIEW SongPerformanceHistory AS
SELECT 
    s.Song_ID,
    s.Song_Name,
    s.Album,
    a.Artist_ID,
    a.Artist_Name,
    COUNT(sl.Concert_ID) AS Times_Played,
    MIN(c.Concert_Date) AS First_Played_Date,
    MAX(c.Concert_Date) AS Last_Played_Date,
    ROUND(AVG(sl.Song_Order), 1) AS Avg_Setlist_Position
FROM Songs s
JOIN Artists a ON s.Artist_ID = a.Artist_ID
LEFT JOIN Setlists sl ON s.Song_ID = sl.Song_ID
LEFT JOIN Concerts c ON sl.Concert_ID = c.Concert_ID
GROUP BY s.Song_ID, s.Song_Name, s.Album, a.Artist_ID, a.Artist_Name;

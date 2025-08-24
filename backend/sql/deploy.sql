CREATE DATABASE IF NOT EXISTS fypwhere;

USE fypwhere;

CREATE TABLE IF NOT EXISTS regulation_snapshots (
    regulation_snapshot_id INT AUTO_INCREMENT PRIMARY KEY,
    hash_value VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL,
    INDEX idx_hash_value (hash_value)
);

CREATE TABLE IF NOT EXISTS change_records (
    change_record_id INT AUTO_INCREMENT PRIMARY KEY,
    regulation_snapshot_id INT NOT NULL,
    old_data TEXT,
    new_data TEXT,
    discovered_at DATETIME NOT NULL,
    effective_at DATETIME,
    status VARCHAR(50) NOT NULL,
    INDEX idx_status (status),
    INDEX idx_discovered_at (discovered_at),
    CONSTRAINT fk_snapshot
        FOREIGN KEY (regulation_snapshot_id)
        REFERENCES regulation_snapshots(regulation_snapshot_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

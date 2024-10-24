-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS audio_library;

-- Use the audio_library database
USE audio_library;

-- Create the audio_entries table
CREATE TABLE IF NOT EXISTS audio_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  audio_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add an index to improve query performance
CREATE INDEX idx_date ON audio_entries (date);
CREATE INDEX idx_category ON audio_entries (category);

-- Optional: Add some sample data
INSERT INTO audio_entries (program_name, date, category, description, audio_url) VALUES
('Sample Program 1', '2023-04-15', 'Music', 'A sample music program', '/uploads/sample1.mp3'),
('Sample Program 2', '2023-04-16', 'Talk Show', 'A sample talk show', '/uploads/sample2.mp3');

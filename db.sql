PRAGMA foreign_keys = ON;
PRAGMA defer_foreign_keys = true;
-- Drop existing tables if they exist
DROP TABLE IF EXISTS creators;
DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS domains;

-- Create the creators table
CREATE TABLE IF NOT EXISTS creators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  discovered_on TEXT NOT NULL
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER,
  platform TEXT,
  handle TEXT,
  link TEXT NOT NULL,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  discovered_on TEXT,
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
);

-- Create domains table to track domain frequency and associated platform
CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL,  -- e.g., 'youtube', 'patreon', 'other'
  quantity INTEGER DEFAULT 0  -- Keeps track of link count for each domain
);

-- Insert sample data into creators table
INSERT INTO creators (name, discovered_on) VALUES 
  ('John Doe', 'YouTube'),
  ('Jane Smith', 'Patreon'),
  ('Alice Brown', 'Other');

-- Insert sample data into links table, associating each link with a creator
INSERT INTO links (creator_id, platform, handle, link, discovered_on) VALUES 
  (1, 'youtube', '@john_doe', 'https://youtube.com/c/johndoe', 'YouTube'),
  (1, 'patreon', 'john_patreon', 'https://patreon.com/johndoe', 'YouTube'),
  (2, 'patreon', '@jane_smith', 'https://patreon.com/janesmith', 'Patreon'),
  (3, 'other', 'alice_social', 'https://linktree.com/alicebrown', 'Linktree');

-- Insert sample data into domains table
INSERT INTO domains (domain, platform, quantity) VALUES
  ('youtube.com', 'youtube', 1),
  ('patreon.com', 'patreon', 2),
  ('linktree.com', 'other', 1);

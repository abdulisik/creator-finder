PRAGMA foreign_keys = ON;
PRAGMA defer_foreign_keys = true;
-- Drop existing tables if they exist
DROP TABLE IF EXISTS youtube;
DROP TABLE IF EXISTS patreon;
DROP TABLE IF EXISTS other_links;
DROP TABLE IF EXISTS creators;

-- Create the creators table
CREATE TABLE creators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  discovered_on TEXT NOT NULL
);

-- Create the youtube table
CREATE TABLE youtube (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER,
  handle TEXT NOT NULL,
  link TEXT NOT NULL,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  discovered_on TEXT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
);

-- Create the patreon table
CREATE TABLE patreon (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER,
  handle TEXT NOT NULL,
  link TEXT NOT NULL,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  discovered_on TEXT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
);

-- Create the other_links table
CREATE TABLE other_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  link TEXT NOT NULL,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  discovered_on TEXT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
);

-- Insert test data into the creators table
INSERT INTO creators (name, discovered_on) VALUES ('John Doe', 'Search Engine');

-- Insert test data into the youtube table
INSERT INTO youtube (creator_id, handle, link, discovered_on) 
VALUES (1, '@john_channel', 'https://youtube.com/johndoe', 'Google Search');

-- Insert test data into the patreon table
INSERT INTO patreon (creator_id, handle, link, discovered_on) 
VALUES (1, 'johnpatreon', 'https://patreon.com/johndoe', 'Twitter');

-- Insert test data into the other_links table
INSERT INTO other_links (creator_id, platform, handle, link, discovered_on) 
VALUES (1, 'Instagram', 'johninsta', 'https://instagram.com/johndoe', 'Instagram Search');

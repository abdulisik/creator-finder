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
  link TEXT UNIQUE NOT NULL,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  discovered_on TEXT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
);

-- Create domains table to track domain frequency and associated platform
CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL,  -- e.g., 'youtube', 'patreon', 'other'
  quantity INTEGER DEFAULT 0  -- Keeps track of link count for each domain
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_creators_name ON creators(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_links_link ON links(link);
CREATE UNIQUE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);
CREATE INDEX IF NOT EXISTS idx_links_creator_id ON links(creator_id);

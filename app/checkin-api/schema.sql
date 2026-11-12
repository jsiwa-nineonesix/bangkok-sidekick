-- Private check-in database. Run once: npx wrangler d1 execute bangkok-sidekick-checkin --remote --file schema.sql
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, label TEXT, contact TEXT,
  role TEXT NOT NULL CHECK (role IN ('rte','sm','viewer')),
  spoc INTEGER NOT NULL DEFAULT 0, group_id TEXT, pin_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS groups (id TEXT PRIMARY KEY, buddy_id TEXT NOT NULL, sort INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY, group_id TEXT NOT NULL, name TEXT NOT NULL,
  company TEXT, team TEXT, art TEXT, country TEXT, sort INTEGER NOT NULL
);
-- A row means the step is done (step 1, "card created", is implicit for everyone).
CREATE TABLE IF NOT EXISTS steps (
  visitor_id TEXT NOT NULL, step INTEGER NOT NULL, at TEXT NOT NULL, by_id TEXT NOT NULL,
  PRIMARY KEY (visitor_id, step)
);
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, by_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL, step INTEGER NOT NULL, done INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT NOT NULL, at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_visitors_group ON visitors(group_id);
CREATE INDEX IF NOT EXISTS idx_attempts ON login_attempts(ip, at);

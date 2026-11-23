CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,            -- UTC ISO time
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,                -- up to 1000 chars
  name TEXT,                   -- optional, up to 60 chars
  ver TEXT,                    -- app version
  device TEXT,                 -- "iPhone", "Android", "Mac", ... (no full user agent)
  iph TEXT,                    -- salted hash of IP, only for rate limiting; deleted after 1 day
  hidden INTEGER NOT NULL DEFAULT 0,   -- 1 = hidden from the in-app board
  metoo INTEGER NOT NULL DEFAULT 0     -- "Me too" count
);
CREATE INDEX IF NOT EXISTS feedback_iph_ts ON feedback (iph, ts);
CREATE TABLE IF NOT EXISTS votes (fid INTEGER NOT NULL, iph TEXT NOT NULL, ts TEXT NOT NULL, PRIMARY KEY (fid, iph));
-- Replies to a comment. team = 1 for the owner's official "Sidekick team" reply (only via /admin/reply).
CREATE TABLE IF NOT EXISTS replies (id INTEGER PRIMARY KEY AUTOINCREMENT, fid INTEGER NOT NULL, ts TEXT NOT NULL,
  text TEXT NOT NULL, name TEXT, team INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, iph TEXT);
CREATE INDEX IF NOT EXISTS replies_fid ON replies (fid);
CREATE INDEX IF NOT EXISTS replies_iph_ts ON replies (iph, ts);

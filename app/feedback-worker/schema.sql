CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,            -- UTC ISO time
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,                -- up to 1000 chars
  name TEXT,                   -- optional, up to 60 chars
  ver TEXT,                    -- app version
  device TEXT,                 -- "iPhone", "Android", "Mac", ... (no full user agent)
  iph TEXT                     -- salted hash of IP, only for rate limiting; deleted after 1 day
);
CREATE INDEX IF NOT EXISTS feedback_iph_ts ON feedback (iph, ts);

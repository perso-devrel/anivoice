import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function migrate() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      photo_url TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      credit_seconds INTEGER NOT NULL DEFAULT 360000,
      language TEXT NOT NULL DEFAULT 'ko',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL DEFAULT '',
      original_file_name TEXT,
      source_language TEXT NOT NULL DEFAULT 'auto',
      target_language TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'uploading',
      progress INTEGER NOT NULL DEFAULT 0,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      perso_project_seq INTEGER,
      perso_space_seq INTEGER,
      thumbnail_url TEXT,
      video_url TEXT,
      audio_url TEXT,
      subtitle_url TEXT,
      zip_url TEXT,
      is_public INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_public ON projects(is_public) WHERE is_public = 1;

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      display_name_ko TEXT,
      display_name_en TEXT
    );

    CREATE TABLE IF NOT EXISTS project_tags (
      project_id INTEGER NOT NULL REFERENCES projects(id),
      tag_id INTEGER NOT NULL REFERENCES tags(id),
      PRIMARY KEY (project_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS credit_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      amount_seconds INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      description TEXT,
      project_id INTEGER REFERENCES projects(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_credit_txn_user ON credit_transactions(user_id);

    INSERT OR IGNORE INTO tags (name, display_name_ko, display_name_en) VALUES
      ('action', '액션', 'Action'),
      ('romance', '로맨스', 'Romance'),
      ('comedy', '코미디', 'Comedy'),
      ('fantasy', '판타지', 'Fantasy'),
      ('sci-fi', 'SF', 'Sci-Fi'),
      ('horror', '호러', 'Horror'),
      ('drama', '드라마', 'Drama'),
      ('sports', '스포츠', 'Sports'),
      ('slice-of-life', '일상', 'Slice of Life'),
      ('mecha', '메카', 'Mecha');

    -- One-time seed migration: bump free users still at old default (60s) to 100 hours.
    -- Users who already dubbed (credit_seconds != 60) are unaffected.
    UPDATE users SET credit_seconds = 360000 WHERE plan = 'free' AND credit_seconds = 60;
  `);

  // Add is_favorite column if it doesn't exist yet (ALTER TABLE is not idempotent in SQLite)
  try {
    await db.execute({ sql: `ALTER TABLE projects ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0`, args: [] });
  } catch {
    // column already exists — safe to ignore
  }
}

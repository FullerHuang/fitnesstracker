import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('fitness.db');
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDatabase();

  database.execSync('PRAGMA journal_mode = WAL;');
  database.execSync('PRAGMA foreign_keys = ON;');

  database.execSync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '其他',
      is_default INTEGER NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS training_sessions (
      id TEXT PRIMARY KEY,
      exercise_id TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS training_sets (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      weight REAL NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      rpe REAL,
      is_pr INTEGER NOT NULL DEFAULT 0,
      extra_fields TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exercise_videos (
      id TEXT PRIMARY KEY,
      exercise_id TEXT,
      session_id TEXT,
      url TEXT NOT NULL,
      platform TEXT NOT NULL DEFAULT 'other',
      title TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
      FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS session_images (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      uri TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_date ON training_sessions(date);
    CREATE INDEX IF NOT EXISTS idx_sessions_exercise ON training_sessions(exercise_id);
    CREATE INDEX IF NOT EXISTS idx_sets_session ON training_sets(session_id);
  `);
}

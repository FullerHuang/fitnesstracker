import { getDatabase } from './database';

export interface TrainingSession {
  id: string;
  exercise_id: string;
  date: string;
  notes: string;
  created_at: number;
  updated_at: number;
}

export interface SessionWithExercise extends TrainingSession {
  exercise_name: string;
  category: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export function createSession(exerciseId: string, date: string): TrainingSession {
  const db = getDatabase();
  const id = generateId();
  const now = Date.now();
  const session: TrainingSession = {
    id,
    exercise_id: exerciseId,
    date,
    notes: '',
    created_at: now,
    updated_at: now,
  };
  db.runSync(
    'INSERT INTO training_sessions (id, exercise_id, date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);',
    [session.id, session.exercise_id, session.date, session.notes, session.created_at, session.updated_at]
  );
  return session;
}

export function getSessionsByDate(date: string): SessionWithExercise[] {
  const db = getDatabase();
  return db.getAllSync<SessionWithExercise>(
    `SELECT ts.*, e.name as exercise_name, e.category
     FROM training_sessions ts
     JOIN exercises e ON ts.exercise_id = e.id
     WHERE ts.date = ?
     ORDER BY ts.created_at DESC;`,
    [date]
  );
}

export function getSessionById(id: string): SessionWithExercise | null {
  const db = getDatabase();
  return db.getFirstSync<SessionWithExercise>(
    `SELECT ts.*, e.name as exercise_name, e.category
     FROM training_sessions ts
     JOIN exercises e ON ts.exercise_id = e.id
     WHERE ts.id = ?;`,
    [id]
  );
}

export function getSessionsByExercise(exerciseId: string): SessionWithExercise[] {
  const db = getDatabase();
  return db.getAllSync<SessionWithExercise>(
    `SELECT ts.*, e.name as exercise_name, e.category
     FROM training_sessions ts
     JOIN exercises e ON ts.exercise_id = e.id
     WHERE ts.exercise_id = ?
     ORDER BY ts.date DESC;`,
    [exerciseId]
  );
}

export function getSessionsByDateRange(startDate: string, endDate: string): SessionWithExercise[] {
  const db = getDatabase();
  return db.getAllSync<SessionWithExercise>(
    `SELECT ts.*, e.name as exercise_name, e.category
     FROM training_sessions ts
     JOIN exercises e ON ts.exercise_id = e.id
     WHERE ts.date >= ? AND ts.date <= ?
     ORDER BY ts.date DESC;`,
    [startDate, endDate]
  );
}

export function updateSessionNotes(id: string, notes: string): void {
  const db = getDatabase();
  db.runSync(
    'UPDATE training_sessions SET notes = ?, updated_at = ? WHERE id = ?;',
    [notes, Date.now(), id]
  );
}

export function deleteSession(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM training_sessions WHERE id = ?;', [id]);
}

export function getDatesWithSessions(): string[] {
  const db = getDatabase();
  const rows = db.getAllSync<{ date: string }>(
    'SELECT DISTINCT date FROM training_sessions ORDER BY date DESC;'
  );
  return rows.map((r) => r.date);
}

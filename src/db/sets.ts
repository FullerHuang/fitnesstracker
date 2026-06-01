import { getDatabase } from './database';

export interface TrainingSet {
  id: string;
  session_id: string;
  set_number: number;
  weight: number;
  reps: number;
  rpe: number | null;
  is_pr: number;
  extra_fields: string;
  created_at: number;
}

export interface CreateSetInput {
  session_id: string;
  set_number: number;
  weight: number;
  reps: number;
  rpe?: number | null;
  is_pr?: boolean;
  extra_fields?: Record<string, string>;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export function createSet(input: CreateSetInput): TrainingSet {
  const db = getDatabase();
  const id = generateId();
  const setRow: TrainingSet = {
    id,
    session_id: input.session_id,
    set_number: input.set_number,
    weight: input.weight,
    reps: input.reps,
    rpe: input.rpe ?? null,
    is_pr: input.is_pr ? 1 : 0,
    extra_fields: JSON.stringify(input.extra_fields || {}),
    created_at: Date.now(),
  };
  db.runSync(
    'INSERT INTO training_sets (id, session_id, set_number, weight, reps, rpe, is_pr, extra_fields, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [setRow.id, setRow.session_id, setRow.set_number, setRow.weight, setRow.reps, setRow.rpe, setRow.is_pr, setRow.extra_fields, setRow.created_at]
  );
  return setRow;
}

export function getSetsBySession(sessionId: string): TrainingSet[] {
  const db = getDatabase();
  return db.getAllSync<TrainingSet>(
    'SELECT * FROM training_sets WHERE session_id = ? ORDER BY set_number;',
    [sessionId]
  );
}

export function updateSet(id: string, input: Partial<CreateSetInput>): void {
  const db = getDatabase();
  db.runSync(
    `UPDATE training_sets
     SET weight = COALESCE(?, weight),
         reps = COALESCE(?, reps),
         rpe = COALESCE(?, rpe),
         is_pr = COALESCE(?, is_pr),
         extra_fields = COALESCE(?, extra_fields)
     WHERE id = ?;`,
    [
      input.weight ?? null,
      input.reps ?? null,
      input.rpe ?? null,
      input.is_pr !== undefined ? (input.is_pr ? 1 : 0) : null,
      input.extra_fields ? JSON.stringify(input.extra_fields) : null,
      id,
    ]
  );
}

export function deleteSet(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM training_sets WHERE id = ?;', [id]);
}

export function deleteSetsBySession(sessionId: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM training_sets WHERE session_id = ?;', [sessionId]);
}

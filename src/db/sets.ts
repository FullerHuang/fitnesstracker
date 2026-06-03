import { getDatabase } from './database';

export interface TrainingSet {
  id: string;
  session_id: string;
  set_number: number;
  target_weight: number;
  target_reps: number;
  target_rpe: number | null;
  weight: number;
  reps: number;
  rpe: number | null;
  custom_fields: string;
  created_at: number;
}

export interface CreateSetInput {
  session_id: string;
  set_number: number;
  target_weight: number;
  target_reps: number;
  target_rpe?: number | null;
  weight: number;
  reps: number;
  rpe?: number | null;
  custom_fields?: string;
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
    target_weight: input.target_weight,
    target_reps: input.target_reps,
    target_rpe: input.target_rpe ?? null,
    weight: input.weight,
    reps: input.reps,
    rpe: input.rpe ?? null,
    custom_fields: input.custom_fields || '[]',
    created_at: Date.now(),
  };
  db.runSync(
    'INSERT INTO training_sets (id, session_id, set_number, target_weight, target_reps, target_rpe, weight, reps, rpe, custom_fields, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [setRow.id, setRow.session_id, setRow.set_number, setRow.target_weight, setRow.target_reps, setRow.target_rpe, setRow.weight, setRow.reps, setRow.rpe, setRow.custom_fields, setRow.created_at]
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
     SET target_weight = COALESCE(?, target_weight),
         target_reps = COALESCE(?, target_reps),
         target_rpe = COALESCE(?, target_rpe),
         weight = COALESCE(?, weight),
         reps = COALESCE(?, reps),
         rpe = COALESCE(?, rpe),
         custom_fields = COALESCE(?, custom_fields)
     WHERE id = ?;`,
    [
      input.target_weight ?? null,
      input.target_reps ?? null,
      input.target_rpe ?? null,
      input.weight ?? null,
      input.reps ?? null,
      input.rpe ?? null,
      input.custom_fields ?? null,
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

export function getAllSets(): TrainingSet[] {
  const db = getDatabase();
  return db.getAllSync<TrainingSet>('SELECT * FROM training_sets ORDER BY session_id, set_number;');
}

export function importSet(row: TrainingSet): void {
  const db = getDatabase();
  db.runSync(
    'INSERT OR REPLACE INTO training_sets (id, session_id, set_number, target_weight, target_reps, target_rpe, weight, reps, rpe, custom_fields, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [row.id, row.session_id, row.set_number, row.target_weight, row.target_reps, row.target_rpe, row.weight, row.reps, row.rpe, row.custom_fields, row.created_at]
  );
}

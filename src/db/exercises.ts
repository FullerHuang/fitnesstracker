import { getDatabase } from './database';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  is_default: number;
  notes: string;
  created_at: number;
  updated_at: number;
}

export interface CreateExerciseInput {
  name: string;
  category?: string;
  notes?: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export function getAllExercises(): Exercise[] {
  const db = getDatabase();
  return db.getAllSync<Exercise>(
    'SELECT * FROM exercises ORDER BY category, name;'
  );
}

export function getExerciseById(id: string): Exercise | null {
  const db = getDatabase();
  return db.getFirstSync<Exercise>('SELECT * FROM exercises WHERE id = ?;', [id]);
}

export function getExercisesByCategory(category: string): Exercise[] {
  const db = getDatabase();
  return db.getAllSync<Exercise>(
    'SELECT * FROM exercises WHERE category = ? ORDER BY name;',
    [category]
  );
}

export function getAllCategories(): string[] {
  const db = getDatabase();
  const rows = db.getAllSync<{ category: string }>(
    'SELECT DISTINCT category FROM exercises ORDER BY category;'
  );
  return rows.map((r) => r.category);
}

export function createExercise(input: CreateExerciseInput): Exercise {
  const db = getDatabase();
  const id = generateId();
  const now = Date.now();
  const exercise: Exercise = {
    id,
    name: input.name,
    category: input.category || '其他',
    is_default: 0,
    notes: input.notes || '',
    created_at: now,
    updated_at: now,
  };
  db.runSync(
    'INSERT INTO exercises (id, name, category, is_default, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [exercise.id, exercise.name, exercise.category, exercise.is_default, exercise.notes, exercise.created_at, exercise.updated_at]
  );
  return exercise;
}

export function updateExercise(id: string, input: Partial<CreateExerciseInput>): void {
  const db = getDatabase();
  const now = Date.now();
  db.runSync(
    'UPDATE exercises SET name = COALESCE(?, name), category = COALESCE(?, category), notes = COALESCE(?, notes), updated_at = ? WHERE id = ?;',
    [input.name ?? null, input.category ?? null, input.notes ?? null, now, id]
  );
}

export function deleteExercise(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM exercises WHERE id = ?;', [id]);
}

export function seedDefaultExercises(defaults: { name: string; category: string }[]): void {
  let db;
  try { db = getDatabase(); } catch { return; }

  const defaultNames = defaults.map((d) => d.name);
  const placeholders = defaultNames.map(() => '?').join(',');

  // 删除不在新列表中的旧默认动作
  db.runSync(
    `DELETE FROM exercises WHERE is_default = 1 AND name NOT IN (${placeholders});`,
    defaultNames
  );

  const now = Date.now();
  for (const ex of defaults) {
    const exists = db.getFirstSync('SELECT 1 FROM exercises WHERE name = ?;', [ex.name]);
    if (exists) continue;
    db.runSync(
      'INSERT INTO exercises (id, name, category, is_default, notes, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?, ?);',
      [generateId(), ex.name, ex.category, now, now]
    );
  }
}

export function importExercise(row: Exercise): void {
  const db = getDatabase();
  db.runSync(
    'INSERT OR REPLACE INTO exercises (id, name, category, is_default, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [row.id, row.name, row.category, row.is_default, row.notes, row.created_at, row.updated_at]
  );
}

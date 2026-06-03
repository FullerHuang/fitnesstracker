import { getDatabase } from './database';

export interface CustomStandard {
  id: string;
  name: string;
  created_at: number;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export function createCustomStandard(name: string): CustomStandard {
  const db = getDatabase();
  const id = generateId();
  const now = Date.now();
  db.runSync(
    'INSERT INTO custom_standards (id, name, created_at) VALUES (?, ?, ?);',
    [id, name.trim(), now]
  );
  return { id, name: name.trim(), created_at: now };
}

export function getAllCustomStandards(): CustomStandard[] {
  const db = getDatabase();
  return db.getAllSync<CustomStandard>('SELECT * FROM custom_standards ORDER BY created_at;');
}

export function deleteCustomStandard(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM custom_standards WHERE id = ?;', [id]);
}

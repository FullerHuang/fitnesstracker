import { getDatabase } from './database';

export interface Template {
  id: string;
  name: string;
  data: string; // JSON: TemplateExercise[]
  created_at: number;
}

export interface TemplateExercise {
  exercise_id: string;
  exercise_name: string;
  category: string;
  sets: {
    set_number: number;
    weight: number;
    reps: number;
    rpe: number | null;
    is_pr: boolean;
  }[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export function createTemplate(name: string, data: TemplateExercise[]): Template {
  const db = getDatabase();
  const id = generateId();
  const now = Date.now();
  const template: Template = {
    id,
    name,
    data: JSON.stringify(data),
    created_at: now,
  };
  db.runSync(
    'INSERT INTO templates (id, name, data, created_at) VALUES (?, ?, ?, ?);',
    [template.id, template.name, template.data, template.created_at]
  );
  return template;
}

export function getAllTemplates(): Template[] {
  const db = getDatabase();
  return db.getAllSync<Template>(
    'SELECT * FROM templates ORDER BY created_at DESC;'
  );
}

export function getTemplateById(id: string): Template | null {
  const db = getDatabase();
  return db.getFirstSync<Template>(
    'SELECT * FROM templates WHERE id = ?;',
    [id]
  );
}

export function deleteTemplate(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM templates WHERE id = ?;', [id]);
}

export function parseTemplateData(template: Template): TemplateExercise[] {
  return JSON.parse(template.data) as TemplateExercise[];
}

export function getTemplateExerciseCount(template: Template): number {
  return parseTemplateData(template).length;
}

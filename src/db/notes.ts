import { getDatabase } from './database';

export interface SessionImage {
  id: string;
  session_id: string;
  uri: string;
  created_at: number;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export function addImage(sessionId: string, uri: string): SessionImage {
  const db = getDatabase();
  const id = generateId();
  const image: SessionImage = { id, session_id: sessionId, uri, created_at: Date.now() };
  db.runSync(
    'INSERT INTO session_images (id, session_id, uri, created_at) VALUES (?, ?, ?, ?);',
    [image.id, image.session_id, image.uri, image.created_at]
  );
  return image;
}

export function getImagesBySession(sessionId: string): SessionImage[] {
  const db = getDatabase();
  return db.getAllSync<SessionImage>(
    'SELECT * FROM session_images WHERE session_id = ? ORDER BY created_at;',
    [sessionId]
  );
}

export function deleteImage(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM session_images WHERE id = ?;', [id]);
}

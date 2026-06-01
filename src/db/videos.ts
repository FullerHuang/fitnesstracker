import { getDatabase } from './database';

export interface ExerciseVideo {
  id: string;
  exercise_id: string | null;
  session_id: string | null;
  url: string;
  platform: 'bilibili' | 'douyin' | 'youtube' | 'other';
  title: string;
  created_at: number;
}

export interface CreateVideoInput {
  exercise_id?: string | null;
  session_id?: string | null;
  url: string;
  platform: string;
  title?: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export function addVideo(input: CreateVideoInput): ExerciseVideo {
  const db = getDatabase();
  const id = generateId();
  const video: ExerciseVideo = {
    id,
    exercise_id: input.exercise_id ?? null,
    session_id: input.session_id ?? null,
    url: input.url,
    platform: input.platform as ExerciseVideo['platform'],
    title: input.title || '',
    created_at: Date.now(),
  };
  db.runSync(
    'INSERT INTO exercise_videos (id, exercise_id, session_id, url, platform, title, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [video.id, video.exercise_id, video.session_id, video.url, video.platform, video.title, video.created_at]
  );
  return video;
}

export function getVideosByExercise(exerciseId: string): ExerciseVideo[] {
  const db = getDatabase();
  return db.getAllSync<ExerciseVideo>(
    'SELECT * FROM exercise_videos WHERE exercise_id = ? ORDER BY created_at;',
    [exerciseId]
  );
}

export function getVideosBySession(sessionId: string): ExerciseVideo[] {
  const db = getDatabase();
  return db.getAllSync<ExerciseVideo>(
    'SELECT * FROM exercise_videos WHERE session_id = ? ORDER BY created_at;',
    [sessionId]
  );
}

export function deleteVideo(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM exercise_videos WHERE id = ?;', [id]);
}

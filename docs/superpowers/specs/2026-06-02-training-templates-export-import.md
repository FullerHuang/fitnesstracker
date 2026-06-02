# Training Templates & Data Export/Import

2026-06-02

## Overview

Two new features:

1. **Training Templates** — save a day's exercises as a reusable template, then batch-import on future days.
2. **Data Export/Import** — export all app data to JSON file, import back later. Survives schema changes.

---

## 1. Training Templates

### 1.1 Data Model

New table `templates`:

```sql
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  data TEXT NOT NULL,  -- JSON: TemplateExercise[]
  created_at INTEGER NOT NULL
);
```

`data` JSON structure (TypeScript):

```ts
interface TemplateExercise {
  exercise_id: string;
  exercise_name: string;  // snapshot — survives exercise deletion
  category: string;       // snapshot
  sets: {
    set_number: number;
    weight: number;
    reps: number;
    rpe: number | null;
    is_pr: boolean;
  }[];
}
```

### 1.2 New Files

| File | Purpose |
|---|---|
| `src/db/templates.ts` | CRUD: `createTemplate`, `getAllTemplates`, `getTemplateById`, `deleteTemplate` |
| `src/stores/useTemplateStore.ts` | Zustand: `templates[]`, `loadTemplates()`, `addTemplate()`, `removeTemplate()` |

### 1.3 Create Template Flow

Trigger: Calendar day view (`app/(tabs)/calendar/index.tsx`).

- If `currentSessions.length > 0`, show "存为模板" button next to "记录训练"
- Tap → Alert.prompt for name → serialize day's sessions + sets → `createTemplate()`
- Sets are loaded via `getSetsBySession()` for each session before serializing

### 1.4 Import Template Flow

Trigger: Record screen step 1 (`app/record/[date].tsx`).

- Above exercise list, add "从模板导入" button
- Tap → Modal with template list (name, exercise count, creation date)
- Select template → confirm → for each `TemplateExercise`:
  - Match `exercise_id` to existing exercise; skip with toast if deleted
  - `createSession(exercise_id, date)` → `createSet()` for each set
- After batch create, `loadSessionsByDate(date)` → `router.back()`

### 1.5 Template Management

Location: `app/(tabs)/exercises/index.tsx`.

- Add segment control at top: "动作" | "模板"
- "模板" tab: FlatList of templates, each showing name / exercise count / date
- Swipe-to-delete or long-press → "确认删除此项？" → `deleteTemplate()`

---

## 2. Data Export/Import

### 2.1 Export Format

```json
{
  "version": 1,
  "app": "FitnessTracker",
  "exported_at": "2026-06-02T12:00:00.000Z",
  "data": {
    "exercises": [],
    "training_sessions": [],
    "training_sets": [],
    "exercise_videos": [],
    "templates": [],
    "images": []
  }
}
```

`images` is an empty array for now — reserved for future photo export support.

### 2.2 Export Flow

- Trigger: stats page bottom button "导出数据"
- Read all tables via existing DB functions (`getAllExercises`, `getAllTemplates`, plus new `getAllSessions`, `getAllSets`, `getAllVideos`)
- Build JSON, write to temp file via `expo-file-system`
- Share via `expo-sharing` (system share sheet: save to Files, send to email, etc.)

### 2.3 Import Flow

- Trigger: stats page bottom button "导入数据"
- `expo-document-picker` to select `.json` file
- Validate: `app === "FitnessTracker"` and `version === 1`
- Preview: "找到 X 个动作, Y 条训练记录, Z 个模板, ..."
- Confirm → transaction → `INSERT OR REPLACE` for each row → commit
- Refresh all stores

### 2.4 Import Strategy

`INSERT OR REPLACE` on conflict by primary key:
- Same ID → overwrite (your own export is idempotent)
- New ID → insert (someone else's export merges with yours)

Tables are NOT cleared before import — this is a merge, not a restore.

### 2.5 New DB Functions

| Function | Returns |
|---|---|
| `getAllSessions()` | `TrainingSession[]` |
| `getAllSets()` | `TrainingSet[]` |
| `getAllVideos()` | `ExerciseVideo[]` |
| `importExercises(rows)` | void |
| `importSessions(rows)` | void |
| `importSets(rows)` | void |
| `importVideos(rows)` | void |
| `importTemplates(rows)` | void |

### 2.6 New File

| File | Purpose |
|---|---|
| `src/utils/backup.ts` | `exportData()` and `importData(fileUri)` — orchestrates read/validate/write |

---

## 3. UI Placement Summary

| Feature | Screen | Trigger |
|---|---|---|
| Create template | Calendar day view | "存为模板" button (visible when sessions exist) |
| Import template | Record step 1 | "从模板导入" button above exercise list |
| Manage templates | Exercises tab | Segment switch to "模板" |
| Export data | Stats tab | "导出数据" button at bottom |
| Import data | Stats tab | "导入数据" button at bottom |

---

## 4. Dependencies

Existing packages provide all needed functionality:
- `expo-file-system` (already installed) — write temp JSON file
- `expo-sharing` (already installed) — share export file
- `expo-document-picker` — **needs install** for import

---

## 5. Out of Scope

- Photo export/import (reserved field `images` in export format)
- Template editing (rename, modify contents)
- Cloud sync / backup
- Template sharing between users

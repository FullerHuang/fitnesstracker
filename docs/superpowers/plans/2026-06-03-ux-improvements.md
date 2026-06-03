# UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Five UX improvements: set restructure (target/actual + custom standards), exercise detail fixes, notes migration, keyboard avoidance, video link fix.

**Architecture:** DB schema changes (new columns, new table), SetRow/SetEditor complete rewrite, notes move from sessions to exercises, KeyboardAvoidingView wrapping, Linking.openURL simplification.

**Tech Stack:** React Native 0.85, Expo SDK 56, expo-sqlite (sync), Zustand 5, TypeScript strict

---

### Task 1: DB schema — training_sets new columns + custom_standards table

**Files:**
- Modify: `src/db/database.ts` — add custom_standards table
- Create: `src/db/customStandards.ts` — CRUD

In `database.ts`, add after templates table:

```sql
CREATE TABLE IF NOT EXISTS custom_standards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);
```

Also ALTER training_sets to add new columns (SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS directly, but we can use a migration approach). Actually, since SQLite doesn't have IF NOT EXISTS for ALTER TABLE, we need to handle this carefully. The simplest approach: use `ALTER TABLE training_sets ADD COLUMN target_weight REAL NOT NULL DEFAULT 0;` and catch the error if column already exists.

Create `src/db/customStandards.ts`:

```ts
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
```

### Task 2: DB — update training_sets CRUD + drop is_pr

**Files:**
- Modify: `src/db/sets.ts` — new TrainingSet interface, update createSet/updateSet/importSet

New TrainingSet interface:
```ts
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
```

New CreateSetInput:
```ts
export interface CreateSetInput {
  session_id: string;
  set_number: number;
  target_weight: number;
  target_reps: number;
  target_rpe?: number | null;
  weight: number;
  reps: number;
  rpe?: number | null;
  custom_fields?: Record<string, unknown>;
}
```

Update createSet, updateSet, getAllSets, importSet to handle new columns. Remove is_pr references. Add migration ALTER TABLE statements in database.ts.

### Task 3: Custom Standards Store

**Files:**
- Create: `src/stores/useCustomStandardStore.ts`

```ts
import { create } from 'zustand';
import { CustomStandard, createCustomStandard, getAllCustomStandards, deleteCustomStandard } from '../db/customStandards';

interface CustomStandardState {
  standards: CustomStandard[];
  loading: boolean;
  loadStandards: () => void;
  addStandard: (name: string) => CustomStandard;
  removeStandard: (id: string) => void;
}

export const useCustomStandardStore = create<CustomStandardState>((set) => ({
  standards: [],
  loading: false,
  loadStandards: () => {
    try {
      const standards = getAllCustomStandards();
      set({ standards, loading: false });
    } catch {
      set({ standards: [], loading: false });
    }
  },
  addStandard: (name) => {
    const s = createCustomStandard(name);
    set((st) => ({ standards: [...st.standards, s] }));
    return s;
  },
  removeStandard: (id) => {
    deleteCustomStandard(id);
    set((st) => ({ standards: st.standards.filter((s) => s.id !== id) }));
  },
}));
```

### Task 4: Rewrite SetRow component

**Files:**
- Modify: `src/components/SetRow.tsx`

Complete rewrite. New SetData interface:
```ts
export interface SetData {
  set_number: number;
  target_weight: number;
  target_reps: number;
  target_rpe: number | null;
  weight: number;
  reps: number;
  rpe: number | null;
  custom_fields: { name: string; target: number; actual: number }[];
}
```

UI: vertical card with target section (3 fixed inputs + custom standard rows with target value + add button + delete per custom) and actual section (3 fixed inputs, custom standard rows with actual value only, read-only names, no delete).

Weight inputs use `keyboardType="decimal-pad"`.

### Task 5: Update SetEditor

**Files:**
- Modify: `src/components/SetEditor.tsx`

Update addSet to use new SetData defaults (target_weight, target_reps, target_rpe, weight, reps, rpe, custom_fields). Carry forward last set's target values too.

### Task 6: Video link fix

**Files:**
- Modify: `src/utils/videoPlatform.ts`

Replace openVideo implementation to skip canOpenURL:
```ts
export async function openVideo(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
```

### Task 7: Exercise detail — text color + editable name/category + notes

**Files:**
- Modify: `app/(tabs)/exercises/[id].tsx`

- Change `heroName` color: `'#fff'` → `'#111111'`
- Make hero section Pressable → Modal with name/category TextInputs
- Add notes section (display + edit exercise.notes)
- Wrap with KeyboardAvoidingView

### Task 8: Session detail — update SetRow usage, notes → exercise.notes

**Files:**
- Modify: `app/(tabs)/calendar/session/[sessionId].tsx`

- Update SetRow mapping to new SetData format
- Replace notes section: read/write exercise.notes instead of session.notes
- Wrap with KeyboardAvoidingView

### Task 9: Record screen — update SetData, remove notes

**Files:**
- Modify: `app/record/[date].tsx`

- Update SetData initial values to include target fields
- Remove "训练心得" section
- Wrap with KeyboardAvoidingView

### Task 10: Exercises tab — add "标准" segment

**Files:**
- Modify: `app/(tabs)/exercises/index.tsx`

- Add third segment "标准" alongside "动作" and "模板"
- "标准" tab: FlatList of custom standards, add/delete
- Wrap with KeyboardAvoidingView

### Task 11: Other screens — KeyboardAvoidingView

**Files:**
- Modify: `app/(tabs)/calendar/index.tsx` — wrap with KeyboardAvoidingView
- Modify: `app/(tabs)/stats/index.tsx` — wrap with KeyboardAvoidingView

### Task 12: Update templates for new set format

**Files:**
- Modify: `src/db/templates.ts` — update TemplateExercise.sets type

Add target_weight, target_reps, target_rpe to sets in TemplateExercise. Update parseTemplateData and createTemplate accordingly.

### Task 13: Final verification

Run: `npx tsc --noEmit` + `npx jest --passWithNoTests`
Fix any issues. Commit.

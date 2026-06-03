# UX Improvements

2026-06-03

## Overview

Five improvements based on real usage feedback:

1. **SetRow restructure** — target/actual split with custom standards
2. **Exercise detail fixes** — editable name/category, fix text color
3. **Notes migration** — notes belong to exercise, not session
4. **Keyboard avoidance** — inputs stay above keyboard
5. **Video link fix** — open links without `canOpenURL` check

---

## 1. SetRow Restructure

### 1.1 Data Model

Replace `training_sets` columns `is_pr` with new target columns:

```sql
-- Old columns to KEEP: weight, reps, rpe
-- New columns:
target_weight REAL NOT NULL DEFAULT 0,
target_reps   INTEGER NOT NULL DEFAULT 0,
target_rpe    REAL,
-- Old column to DROP: is_pr
-- custom_fields stays: JSON string for custom standards
```

`custom_fields` structure:
```json
[
  { "name": "PR数", "target": 5, "actual": 3 },
  { "name": "离心秒数", "target": 3.0, "actual": 2.5 }
]
```

Target section has 3 fixed fields (weight, reps, RPE) + user-added custom standards.
Actual section has 3 fixed fields (weight, reps, RPE) + matching custom standard values.

### 1.2 `custom_standards` Table

```sql
CREATE TABLE IF NOT EXISTS custom_standards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);
```

CRUD in `src/db/customStandards.ts`.

### 1.3 SetData Type

```ts
interface SetData {
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

### 1.4 SetRow UI

Vertical card layout with two sections:

```
Target section (+ add custom standard button):
  weight / reps / rpe (fixed)
  [custom field: name | target value | delete]
Actual section:
  weight / reps / rpe (fixed)
  [custom field: name | actual value] (auto-generated, no delete)
```

Weight inputs use `keyboardType="decimal-pad"`.

### 1.5 Custom Standards Management

Global pool, managed in exercises tab ("动作库") alongside template management as a third segment: "动作" | "模板" | "标准".

### 1.6 Template Compatibility

Templates' `TemplateExercise.sets` must include new target fields and custom_fields. Existing templates will be incompatible and purged (or migrated).

---

## 2. Exercise Detail Page

### 2.1 Text Color

`heroName` color: `'#fff'` → `'#111111'` (visible on `#F8F9FA` background).

### 2.2 Editable Name & Category

- `heroName` and `heroBadge` become Pressable
- Tap → Modal with TextInput for name and category
- Category input uses existing category list as suggestions
- Save calls `useExerciseStore.editExercise(id, {name, category})`

---

## 3. Notes Migration

- Notes move from `training_sessions.notes` to `exercises.notes` (column already exists)
- `training_sessions.notes` dropped from schema (not from code — column stays but unused, cleaned later)
- Record screen: remove notes input section
- Session detail: "训练心得" reads/writes `exercise.notes`
- Exercise detail: add notes display and edit

---

## 4. Keyboard Avoidance

- Wrap all ScrollViews with `KeyboardAvoidingView behavior="padding"`
- Affected screens: record, session detail, exercise detail, calendar

---

## 5. Video Link Fix

`openVideo()` in `videoPlatform.ts`:

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

Remove `canOpenURL()` check — it returns false on Android 11+ for third-party app schemes not declared in the manifest.

---

## 6. Files to Modify

| File | Changes |
|---|---|
| `src/db/database.ts` | Add custom_standards table; alter training_sets columns |
| `src/db/sets.ts` | Update TrainingSet interface, CreateSetInput, createSet, updateSet |
| `src/db/customStandards.ts` | **Create** — CRUD for custom standards |
| `src/stores/useCustomStandardStore.ts` | **Create** — Zustand store |
| `src/components/SetRow.tsx` | Complete rewrite — vertical target/actual layout |
| `src/components/SetEditor.tsx` | Update SetData references |
| `app/record/[date].tsx` | Update SetData init, remove notes section |
| `app/(tabs)/calendar/session/[sessionId].tsx` | Update SetRow usage, notes → exercise.notes |
| `app/(tabs)/exercises/[id].tsx` | Fix text color, add edit modal, add notes display |
| `app/(tabs)/exercises/index.tsx` | Add "标准" segment |
| `app/(tabs)/stats/index.tsx` | Wrap with KeyboardAvoidingView |
| `src/utils/videoPlatform.ts` | Simplify openVideo |
| `src/db/sessions.ts` | Remove notes column references |
| `src/db/templates.ts` | Update TemplateExercise.sets type |
| `app/(tabs)/calendar/index.tsx` | KeyboardAvoidingView |

## 7. Out of Scope

- Database migration for existing data (new schema creates new columns with defaults; old `is_pr` column stays but unused)
- Template migration (existing templates with old set format will be purged since this is early-stage usage)

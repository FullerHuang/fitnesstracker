# Training Templates & Data Export/Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add training template (save/load day exercises) and data export/import (JSON backup) features.

**Architecture:** New `templates` DB table with JSON snapshot, Zustand store, UI changes across 4 screens (calendar, record, exercises, stats). New `backup.ts` utility orchestrates export/import via expo-file-system, expo-sharing, expo-document-picker.

**Tech Stack:** React Native 0.85, Expo SDK 56, expo-sqlite (sync), Zustand 5, TypeScript strict

---

### Task 1: Install new dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install expo packages**

Run: `npx expo install expo-file-system expo-sharing expo-document-picker`

- [ ] **Step 2: Verify install**

Run: `grep "expo-file-system\|expo-sharing\|expo-document-picker" package.json`
Expected: All three appear in dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install expo-file-system, expo-sharing, expo-document-picker"
```

---

### Task 2: Database — templates table

**Files:**
- Modify: `src/db/database.ts:76-86`
- Create: `src/db/templates.ts`

- [ ] **Step 1: Add templates table to initializeDatabase**

In `src/db/database.ts`, add after the `session_images` CREATE TABLE block (after line 82):

```sql
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

Full edit — in `initializeDatabase()`, add this block before the `CREATE INDEX` statements at line 84:

```ts
database.execSync(`
  CREATE TABLE IF NOT EXISTS exercises (
    ...
  );

  CREATE TABLE IF NOT EXISTS training_sessions (
    ...
  );

  CREATE TABLE IF NOT EXISTS training_sets (
    ...
  );

  CREATE TABLE IF NOT EXISTS exercise_videos (
    ...
  );

  CREATE TABLE IF NOT EXISTS session_images (
    ...
  );

  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_date ON training_sessions(date);
  ...
`);
```

- [ ] **Step 2: Create templates CRUD file**

Create `src/db/templates.ts`:

```ts
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
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/db/database.ts src/db/templates.ts
git commit -m "feat: add templates table and CRUD functions"
```

---

### Task 3: Database — read-all and import functions for export/import

**Files:**
- Modify: `src/db/sessions.ts`, `src/db/sets.ts`, `src/db/videos.ts`, `src/db/exercises.ts`, `src/db/templates.ts`

- [ ] **Step 1: Add getAllSessions to sessions.ts**

Append to `src/db/sessions.ts`:

```ts
export function getAllSessions(): TrainingSession[] {
  const db = getDatabase();
  return db.getAllSync<TrainingSession>('SELECT * FROM training_sessions ORDER BY date DESC;');
}
```

- [ ] **Step 2: Add getAllSets to sets.ts**

Append to `src/db/sets.ts`:

```ts
export function getAllSets(): TrainingSet[] {
  const db = getDatabase();
  return db.getAllSync<TrainingSet>('SELECT * FROM training_sets ORDER BY session_id, set_number;');
}
```

- [ ] **Step 3: Add getAllVideos to videos.ts**

Append to `src/db/videos.ts`:

```ts
export function getAllVideos(): ExerciseVideo[] {
  const db = getDatabase();
  return db.getAllSync<ExerciseVideo>('SELECT * FROM exercise_videos ORDER BY created_at;');
}
```

- [ ] **Step 4: Add import functions to each db module**

Append to `src/db/exercises.ts`:

```ts
export function importExercise(row: Exercise): void {
  const db = getDatabase();
  db.runSync(
    'INSERT OR REPLACE INTO exercises (id, name, category, is_default, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [row.id, row.name, row.category, row.is_default, row.notes, row.created_at, row.updated_at]
  );
}
```

Append to `src/db/sessions.ts`:

```ts
export function importSession(row: TrainingSession): void {
  const db = getDatabase();
  db.runSync(
    'INSERT OR REPLACE INTO training_sessions (id, exercise_id, date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);',
    [row.id, row.exercise_id, row.date, row.notes, row.created_at, row.updated_at]
  );
}
```

Append to `src/db/sets.ts`:

```ts
export function importSet(row: TrainingSet): void {
  const db = getDatabase();
  db.runSync(
    'INSERT OR REPLACE INTO training_sets (id, session_id, set_number, weight, reps, rpe, is_pr, extra_fields, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [row.id, row.session_id, row.set_number, row.weight, row.reps, row.rpe, row.is_pr, row.extra_fields, row.created_at]
  );
}
```

Append to `src/db/videos.ts`:

```ts
export function importVideo(row: ExerciseVideo): void {
  const db = getDatabase();
  db.runSync(
    'INSERT OR REPLACE INTO exercise_videos (id, exercise_id, session_id, url, platform, title, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [row.id, row.exercise_id, row.session_id, row.url, row.platform, row.title, row.created_at]
  );
}
```

Append to `src/db/templates.ts`:

```ts
export function importTemplate(row: Template): void {
  const db = getDatabase();
  db.runSync(
    'INSERT OR REPLACE INTO templates (id, name, data, created_at) VALUES (?, ?, ?, ?);',
    [row.id, row.name, row.data, row.created_at]
  );
}
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/db/sessions.ts src/db/sets.ts src/db/videos.ts src/db/exercises.ts src/db/templates.ts
git commit -m "feat: add getAll/import functions for backup support"
```

---

### Task 4: Template Zustand Store

**Files:**
- Create: `src/stores/useTemplateStore.ts`

- [ ] **Step 1: Create useTemplateStore**

Create `src/stores/useTemplateStore.ts`:

```ts
import { create } from 'zustand';
import {
  Template,
  TemplateExercise,
  createTemplate,
  getAllTemplates,
  deleteTemplate,
  parseTemplateData,
} from '../db/templates';

interface TemplateState {
  templates: Template[];
  loading: boolean;

  loadTemplates: () => void;
  addTemplate: (name: string, data: TemplateExercise[]) => Template;
  removeTemplate: (id: string) => void;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  loading: false,

  loadTemplates: () => {
    try {
      const templates = getAllTemplates();
      set({ templates, loading: false });
    } catch {
      set({ templates: [], loading: false });
    }
  },

  addTemplate: (name, data) => {
    const tpl = createTemplate(name, data);
    set((s) => ({ templates: [tpl, ...s.templates] }));
    return tpl;
  },

  removeTemplate: (id) => {
    deleteTemplate(id);
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
  },
}));
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/stores/useTemplateStore.ts
git commit -m "feat: add useTemplateStore with load/add/remove"
```

---

### Task 5: Backup utility

**Files:**
- Create: `src/utils/backup.ts`

- [ ] **Step 1: Create backup.ts**

Create `src/utils/backup.ts`:

```ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, Platform } from 'react-native';
import { getAllExercises, importExercise, Exercise } from '../db/exercises';
import { getAllSessions, importSession, TrainingSession } from '../db/sessions';
import { getAllSets, importSet, TrainingSet } from '../db/sets';
import { getAllVideos, importVideo, ExerciseVideo } from '../db/videos';
import { getAllTemplates, importTemplate, Template } from '../db/templates';

interface ExportData {
  version: number;
  app: string;
  exported_at: string;
  data: {
    exercises: Exercise[];
    training_sessions: TrainingSession[];
    training_sets: TrainingSet[];
    exercise_videos: ExerciseVideo[];
    templates: Template[];
    images: never[];
  };
}

export async function exportData(): Promise<void> {
  try {
    const exportObj: ExportData = {
      version: 1,
      app: 'FitnessTracker',
      exported_at: new Date().toISOString(),
      data: {
        exercises: getAllExercises(),
        training_sessions: getAllSessions(),
        training_sets: getAllSets(),
        exercise_videos: getAllVideos(),
        templates: getAllTemplates(),
        images: [],
      },
    };

    const json = JSON.stringify(exportObj, null, 2);
    const filename = `FitnessTracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    const filePath = `${FileSystem.cacheDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(filePath, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: '导出训练数据',
        UTI: 'public.json',
      });
    } else {
      Alert.alert('分享不可用', '当前设备不支持文件分享功能');
    }
  } catch (e) {
    console.error('Export failed:', e);
    Alert.alert('导出失败', '导出数据时出错，请重试');
  }
}

export async function importData(): Promise<void> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const file = result.assets[0];
    const content = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const parsed = JSON.parse(content);

    if (parsed.app !== 'FitnessTracker' || parsed.version !== 1) {
      Alert.alert('无效的备份文件', '该文件不是 FitnessTracker 的备份文件或格式不兼容');
      return;
    }

    const d = parsed.data;
    if (!d || !Array.isArray(d.exercises) || !Array.isArray(d.training_sessions)) {
      Alert.alert('无效的备份文件', '备份文件数据格式不正确');
      return;
    }

    const counts = [
      `动作: ${(d.exercises ?? []).length} 个`,
      `训练记录: ${(d.training_sessions ?? []).length} 条`,
      `训练组: ${(d.training_sets ?? []).length} 组`,
      `视频: ${(d.exercise_videos ?? []).length} 个`,
      `模板: ${(d.templates ?? []).length} 个`,
    ].join('\n');

    return new Promise((resolve) => {
      Alert.alert('导入数据预览', `即将导入以下内容：\n\n${counts}\n\n导入不会覆盖已有数据（同 ID 则合并）`, [
        { text: '取消', style: 'cancel', onPress: () => resolve() },
        {
          text: '确认导入',
          onPress: () => {
            try {
              (d.exercises ?? []).forEach((row: Exercise) => importExercise(row));
              (d.training_sessions ?? []).forEach((row: TrainingSession) => importSession(row));
              (d.training_sets ?? []).forEach((row: TrainingSet) => importSet(row));
              (d.exercise_videos ?? []).forEach((row: ExerciseVideo) => importVideo(row));
              (d.templates ?? []).forEach((row: Template) => importTemplate(row));
              Alert.alert('导入完成', '数据已成功导入，请重新打开应用以刷新数据');
              resolve();
            } catch (e) {
              console.error('Import failed:', e);
              Alert.alert('导入失败', '写入数据时出错，请重试');
              resolve();
            }
          },
        },
      ]);
    });
  } catch (e) {
    console.error('Import failed:', e);
    Alert.alert('导入失败', '读取备份文件时出错，请确认文件格式正确');
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/utils/backup.ts
git commit -m "feat: add backup utility for data export/import"
```

---

### Task 6: Template management UI in exercises tab

**Files:**
- Modify: `app/(tabs)/exercises/index.tsx`

- [ ] **Step 1: Add template segment to exercises screen**

The exercises tab needs a segment control switching between "动作" and "模板". Add imports, state, and render logic.

Replace the file content with the updated version. Key changes:

1. Import `useTemplateStore` and `parseTemplateData`
2. Add `segment` state: `'exercises' | 'templates'`
3. Add `useEffect` to load templates
4. When `segment === 'exercises'`, render the existing UI
5. When `segment === 'templates'`, render template list
6. Segment control at top replacing category bar when on templates tab

Here's the complete modified file:

```ts
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useExerciseStore } from '@/stores/useExerciseStore';
import { useTemplateStore } from '@/stores/useTemplateStore';
import { parseTemplateData } from '@/db/templates';
import { ExerciseCard } from '@/components/ExerciseCard';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function ExercisesScreen() {
  const router = useRouter();
  const {
    exercises,
    categories,
    loadExercises,
    loadCategories,
    addExercise,
    removeExercise,
  } = useExerciseStore();
  const { templates, loadTemplates, removeTemplate } = useTemplateStore();

  const [segment, setSegment] = useState<'exercises' | 'templates'>('exercises');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState<string | null>(null);

  useEffect(() => {
    loadExercises();
    loadCategories();
    loadTemplates();
  }, []);

  const displayed = selectedCategory
    ? exercises.filter((e) => e.category === selectedCategory)
    : exercises;

  const handleAdd = () => {
    if (!newName.trim()) return;
    addExercise({ name: newName.trim(), category: newCategory.trim() || undefined });
    setNewName('');
    setNewCategory('');
    setShowAdd(false);
    loadCategories();
  };

  const handleDelete = (id: string) => {
    removeExercise(id);
    setDeleteTarget(null);
  };

  const handleDeleteTemplate = (id: string) => {
    removeTemplate(id);
    setDeleteTemplateTarget(null);
  };

  return (
    <View style={styles.container}>
      {/* Segment Control */}
      <View style={styles.segmentBar}>
        <Pressable
          style={[styles.segmentBtn, segment === 'exercises' && styles.segmentBtnActive]}
          onPress={() => setSegment('exercises')}
        >
          <Text style={[styles.segmentText, segment === 'exercises' && styles.segmentTextActive]}>
            动作
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segmentBtn, segment === 'templates' && styles.segmentBtnActive]}
          onPress={() => setSegment('templates')}
        >
          <Text style={[styles.segmentText, segment === 'templates' && styles.segmentTextActive]}>
            模板
          </Text>
        </Pressable>
      </View>

      {segment === 'exercises' ? (
        <>
          <View style={styles.categoryBar}>
            <Pressable
              style={[styles.chip, !selectedCategory && styles.chipActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>全部</Text>
            </Pressable>
            {categories
              .filter((c) => c !== selectedCategory)
              .map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
          </View>

          <FlatList
            data={displayed}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ExerciseCard
                name={item.name}
                category={item.category}
                onPress={() => router.push(`/(tabs)/exercises/${item.id}`)}
                onLongPress={() => setDeleteTarget(item.id)}
              />
            )}
            ListEmptyComponent={
              <EmptyState icon="🏋️" title="还没有动作" subtitle="点击下方按钮添加自定义动作" />
            }
            contentContainerStyle={displayed.length === 0 ? styles.emptyList : { paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
          />

          {showAdd ? (
            <View style={styles.addPanel}>
              <View style={styles.addPanelHandle} />
              <Text style={styles.addPanelTitle}>添加自定义动作</Text>
              <TextInput
                style={styles.addInput}
                placeholder="动作名称（必填）"
                placeholderTextColor="#999"
                value={newName}
                onChangeText={setNewName}
                autoFocus
              />
              <TextInput
                style={styles.addInput}
                placeholder="分类，如：功能性训练（选填）"
                placeholderTextColor="#999"
                value={newCategory}
                onChangeText={setNewCategory}
              />
              <View style={styles.addButtons}>
                <Pressable style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                  <Text style={styles.cancelText}>取消</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={handleAdd}>
                  <Text style={styles.saveText}>保存动作</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.fab} onPress={() => setShowAdd(true)}>
              <Text style={styles.fabIcon}>+</Text>
              <Text style={styles.fabText}>自定义动作</Text>
            </Pressable>
          )}

          <ConfirmDialog
            visible={deleteTarget !== null}
            title="删除动作"
            message="该动作及其所有训练历史将被永久删除，确认？"
            onConfirm={() => handleDelete(deleteTarget!)}
            onCancel={() => setDeleteTarget(null)}
          />
        </>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const exercises = parseTemplateData(item);
            return (
              <Pressable
                style={styles.templateCard}
                onLongPress={() => setDeleteTemplateTarget(item.id)}
              >
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{item.name}</Text>
                  <Text style={styles.templateMeta}>
                    {exercises.length} 个动作 · {item.created_at ? new Date(item.created_at).toLocaleDateString('zh-CN') : ''}
                  </Text>
                  <View style={styles.templateExerciseList}>
                    {exercises.map((ex, i) => (
                      <Text key={i} style={styles.templateExerciseItem}>
                        {ex.exercise_name} ({ex.sets.length} 组)
                      </Text>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <EmptyState icon="📋" title="还没有模板" subtitle="在训练日历中将某天的训练保存为模板" />
          }
          contentContainerStyle={templates.length === 0 ? styles.emptyList : { paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
        />
      )}

      <ConfirmDialog
        visible={deleteTemplateTarget !== null}
        title="删除模板"
        message="此模板将被永久删除，确认？"
        onConfirm={() => handleDeleteTemplate(deleteTemplateTarget!)}
        onCancel={() => setDeleteTemplateTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  segmentBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentBtnActive: { backgroundColor: '#FFFFFF' },
  segmentText: { fontSize: 14, fontWeight: '600', color: '#777777' },
  segmentTextActive: { color: '#FF6B35' },
  categoryBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  chipText: { color: '#777777', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  emptyList: { flexGrow: 1 },
  addPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  addPanelHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDDDDD',
    alignSelf: 'center',
    marginBottom: 16,
  },
  addPanelTitle: { fontSize: 17, fontWeight: '700', color: '#111111', marginBottom: 16 },
  addInput: {
    backgroundColor: '#F0F0F0',
    color: '#111111',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  addButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  cancelText: { color: '#777777', fontSize: 15, fontWeight: '500' },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
  },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: { color: '#fff', fontSize: 22, fontWeight: '300' },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  templateCard: {
    marginHorizontal: 16,
    marginVertical: 3,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  templateInfo: { gap: 4 },
  templateName: { fontSize: 16, fontWeight: '700', color: '#111111' },
  templateMeta: { fontSize: 12, color: '#777777' },
  templateExerciseList: { marginTop: 8, gap: 2 },
  templateExerciseItem: { fontSize: 13, color: '#555555' },
});
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/exercises/index.tsx
git commit -m "feat: add template management segment to exercises tab"
```

---

### Task 7: Template creation in calendar day view

**Files:**
- Modify: `app/(tabs)/calendar/index.tsx`

- [ ] **Step 1: Add "存为模板" button**

Import `useTemplateStore` and session/set helpers. Add a "存为模板" button next to the "记录训练" button, visible only when sessions exist.

The key change is in the `dayHeader` section. Replace the existing dayHeader content with one that includes the template save button:

In the imports, add:
```ts
import { useTemplateStore } from '@/stores/useTemplateStore';
import { getSetsBySession } from '@/db/sets';
import { TemplateExercise } from '@/db/templates';
```

In the component, add after `const { currentSessions, loadSessionsByDate } = useTrainingStore();`:
```ts
const { addTemplate } = useTemplateStore();
```

Add the save handler function:
```ts
const handleSaveAsTemplate = () => {
  Alert.prompt(
    '保存为模板',
    '为该模板命名：',
    [
      { text: '取消', style: 'cancel' },
      {
        text: '保存',
        onPress: (name?: string) => {
          if (!name?.trim()) {
            Alert.alert('名称不能为空');
            return;
          }
          const data: TemplateExercise[] = currentSessions.map((s) => ({
            exercise_id: s.exercise_id,
            exercise_name: s.exercise_name,
            category: s.category,
            sets: getSetsBySession(s.id).map((ts) => ({
              set_number: ts.set_number,
              weight: ts.weight,
              reps: ts.reps,
              rpe: ts.rpe,
              is_pr: ts.is_pr === 1,
            })),
          }));
          addTemplate(name.trim(), data);
          Alert.alert('保存成功', `模板「${name.trim()}」已保存`);
        },
      },
    ],
    'plain-text',
    selectedDate + ' 训练'
  );
};
```

Then in the JSX, after the "记录训练" button, add:
```tsx
{currentSessions.length > 0 && (
  <Pressable style={styles.templateBtn} onPress={handleSaveAsTemplate}>
    <Text style={styles.templateBtnText}>📋 存为模板</Text>
  </Pressable>
)}
```

Add the style:
```ts
templateBtn: {
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 10,
  backgroundColor: '#F0F0F0',
  borderWidth: 1,
  borderColor: '#E8E8E8',
},
templateBtnText: { color: '#111111', fontSize: 14, fontWeight: '600' },
```

Note: React Native's `Alert.prompt` is iOS only. For cross-platform, use a simple inline text input modal or use `Alert.alert` with buttons and a separate input step.

Since this is a cross-platform app, let's use a different approach. Add a local state for showing the template name input.

Here's the complete modification to calendar/index.tsx:

Add to imports:
```ts
import { Alert, View, Text, ScrollView, Pressable, TextInput, Modal, StyleSheet } from 'react-native';
```

Wait, the existing imports already have those basics. Let me just show the diff approach — add the new state and functions, modify the dayHeader JSX.

Here's what to add after line 14 (`const { currentSessions, loadSessionsByDate } = useTrainingStore();`):

```ts
const { addTemplate } = useTemplateStore();
const [showTemplateModal, setShowTemplateModal] = useState(false);
const [templateName, setTemplateName] = useState('');
```

Add the handler before the `return`:

```ts
const handleSaveAsTemplate = () => {
  setTemplateName(selectedDate + ' 训练');
  setShowTemplateModal(true);
};

const confirmSaveTemplate = () => {
  if (!templateName.trim()) {
    Alert.alert('名称不能为空');
    return;
  }
  const data: TemplateExercise[] = currentSessions.map((s) => ({
    exercise_id: s.exercise_id,
    exercise_name: s.exercise_name,
    category: s.category,
    sets: getSetsBySession(s.id).map((ts) => ({
      set_number: ts.set_number,
      weight: ts.weight,
      reps: ts.reps,
      rpe: ts.rpe,
      is_pr: ts.is_pr === 1,
    })),
  }));
  addTemplate(templateName.trim(), data);
  setShowTemplateModal(false);
  Alert.alert('保存成功', `模板「${templateName.trim()}」已保存`);
};
```

In the JSX dayHeader, change the single button to a row with two buttons:

Replace:
```tsx
<Pressable
  style={styles.startBtn}
  onPress={() => router.push(`/record/${selectedDate}`)}
>
  <Text style={styles.startBtnIcon}>+</Text>
  <Text style={styles.startBtnText}>记录训练</Text>
</Pressable>
```

With:
```tsx
<View style={styles.dayHeaderActions}>
  {currentSessions.length > 0 && (
    <Pressable style={styles.templateBtn} onPress={handleSaveAsTemplate}>
      <Text style={styles.templateBtnText}>📋 存为模板</Text>
    </Pressable>
  )}
  <Pressable
    style={styles.startBtn}
    onPress={() => router.push(`/record/${selectedDate}`)}
  >
    <Text style={styles.startBtnIcon}>+</Text>
    <Text style={styles.startBtnText}>记录训练</Text>
  </Pressable>
</View>
```

At the end of the return JSX (before the closing `</View>`), add the modal:

```tsx
<Modal visible={showTemplateModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>保存为模板</Text>
      <TextInput
        style={styles.modalInput}
        placeholder="模板名称"
        placeholderTextColor="#999"
        value={templateName}
        onChangeText={setTemplateName}
        autoFocus
      />
      <View style={styles.modalButtons}>
        <Pressable style={styles.modalCancelBtn} onPress={() => setShowTemplateModal(false)}>
          <Text style={styles.modalCancelText}>取消</Text>
        </Pressable>
        <Pressable style={styles.modalSaveBtn} onPress={confirmSaveTemplate}>
          <Text style={styles.modalSaveText}>保存</Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>
```

Add these styles:
```ts
dayHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
templateBtn: {
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 10,
  backgroundColor: '#F0F0F0',
  borderWidth: 1,
  borderColor: '#E8E8E8',
},
templateBtnText: { color: '#111111', fontSize: 14, fontWeight: '600' },
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalCard: {
  width: 300,
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 24,
},
modalTitle: { fontSize: 18, fontWeight: '700', color: '#111111', marginBottom: 16 },
modalInput: {
  backgroundColor: '#F0F0F0',
  color: '#111111',
  borderRadius: 10,
  padding: 14,
  fontSize: 15,
  borderWidth: 1,
  borderColor: '#E8E8E8',
  marginBottom: 16,
},
modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
modalCancelBtn: { paddingVertical: 8, paddingHorizontal: 16 },
modalCancelText: { color: '#777777', fontSize: 15 },
modalSaveBtn: {
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 8,
  backgroundColor: '#FF6B35',
},
modalSaveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/calendar/index.tsx
git commit -m "feat: add save-as-template button to calendar day view"
```

---

### Task 8: Template import in record screen

**Files:**
- Modify: `app/record/[date].tsx`

- [ ] **Step 1: Add template import to record screen step 1**

In the imports, add:
```ts
import { useTemplateStore } from '@/stores/useTemplateStore';
import { parseTemplateData } from '@/db/templates';
```

In the component, add after the existing store hooks:
```ts
const { templates, loadTemplates } = useTemplateStore();
```

Already in useEffect, add:
```ts
useEffect(() => {
  loadExercises();
  loadTemplates();
}, []);
```

Add state for the template modal:
```ts
const [showTemplateModal, setShowTemplateModal] = useState(false);
```

Add the batch-import handler:
```ts
const handleImportTemplate = (templateId: string) => {
  const template = templates.find((t) => t.id === templateId);
  if (!template) return;

  const exercises = parseTemplateData(template);
  const { addSession, addSet } = useTrainingStore.getState();
  let created = 0;
  let skipped = 0;

  exercises.forEach((ex) => {
    const match = useExerciseStore.getState().exercises.find((e) => e.id === ex.exercise_id);
    if (!match) {
      skipped++;
      return;
    }
    const session = addSession(match.id, date);
    ex.sets.forEach((s) => {
      addSet({
        session_id: session.id,
        set_number: s.set_number,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
        is_pr: s.is_pr,
      });
    });
    created++;
  });

  setShowTemplateModal(false);
  loadSessionsByDate(date);

  let msg = `成功导入 ${created} 个动作`;
  if (skipped > 0) msg += `，跳过了 ${skipped} 个（原动作已删除）`;
  Alert.alert('导入完成', msg);
  router.back();
};
```

In the step 1 JSX, add the template import button before the exercise list (after the subtitle):

```tsx
<Pressable style={styles.templateImportBtn} onPress={() => setShowTemplateModal(true)}>
  <Text style={styles.templateImportText}>📋 从模板导入</Text>
</Pressable>
```

At the bottom of the component (before the final closing tag), add the template selector modal:

```tsx
<Modal visible={showTemplateModal} transparent animationType="slide">
  <View style={styles.templateModalOverlay}>
    <View style={styles.templateModalSheet}>
      <View style={styles.templateModalHandle} />
      <Text style={styles.templateModalTitle}>选择模板</Text>
      {templates.length === 0 ? (
        <Text style={styles.templateEmptyText}>还没有保存模板</Text>
      ) : (
        <ScrollView style={styles.templateList}>
          {templates.map((tpl) => {
            const exs = parseTemplateData(tpl);
            return (
              <Pressable
                key={tpl.id}
                style={styles.templateOption}
                onPress={() => handleImportTemplate(tpl.id)}
              >
                <Text style={styles.templateOptionName}>{tpl.name}</Text>
                <Text style={styles.templateOptionMeta}>
                  {exs.length} 个动作 · {exs.reduce((sum, ex) => sum + ex.sets.length, 0)} 组
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      <Pressable
        style={styles.templateModalCancel}
        onPress={() => setShowTemplateModal(false)}
      >
        <Text style={styles.templateModalCancelText}>取消</Text>
      </Pressable>
    </View>
  </View>
</Modal>
```

Add these styles to the StyleSheet:
```ts
templateImportBtn: {
  marginHorizontal: 16,
  marginTop: 12,
  marginBottom: 8,
  paddingVertical: 14,
  borderRadius: 12,
  backgroundColor: '#F0F0F0',
  borderWidth: 1,
  borderColor: '#E8E8E8',
  borderStyle: 'dashed',
  alignItems: 'center',
},
templateImportText: { color: '#FF6B35', fontSize: 15, fontWeight: '600' },
templateModalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'flex-end',
},
templateModalSheet: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingBottom: 32,
  maxHeight: '60%',
},
templateModalHandle: {
  width: 36,
  height: 4,
  borderRadius: 2,
  backgroundColor: '#DDDDDD',
  alignSelf: 'center',
  marginTop: 12,
  marginBottom: 16,
},
templateModalTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#111111',
  textAlign: 'center',
  marginBottom: 12,
},
templateEmptyText: {
  fontSize: 14,
  color: '#777777',
  textAlign: 'center',
  paddingVertical: 32,
},
templateList: { maxHeight: 300 },
templateOption: {
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F0F0',
},
templateOptionName: { fontSize: 16, fontWeight: '600', color: '#111111' },
templateOptionMeta: { fontSize: 12, color: '#777777', marginTop: 2 },
templateModalCancel: {
  marginTop: 8,
  marginHorizontal: 16,
  paddingVertical: 14,
  borderRadius: 12,
  backgroundColor: '#F0F0F0',
  alignItems: 'center',
},
templateModalCancelText: { color: '#111111', fontSize: 16, fontWeight: '600' },
```

Also need to add `Modal` to the react-native import at the top.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/record/\[date\].tsx
git commit -m "feat: add template import to record screen"
```

---

### Task 9: Export/Import buttons in stats page

**Files:**
- Modify: `app/(tabs)/stats/index.tsx`

- [ ] **Step 1: Add export/import buttons to stats screen**

Add imports:
```ts
import { Pressable, Alert } from 'react-native';  // update existing import
import { exportData, importData } from '@/utils/backup';
```

At the end of the ScrollView (before `</ScrollView>`), add a divider and the export/import buttons:

```tsx
<View style={styles.backupDivider} />
<Text style={styles.sectionTitle}>数据备份</Text>
<Text style={styles.sectionSubtitle}>导出训练数据为 JSON 文件，以后可以重新导入</Text>
<View style={styles.backupRow}>
  <Pressable style={styles.backupBtn} onPress={exportData}>
    <Text style={styles.backupBtnIcon}>📤</Text>
    <Text style={styles.backupBtnText}>导出数据</Text>
  </Pressable>
  <Pressable style={styles.backupBtnOutline} onPress={importData}>
    <Text style={styles.backupBtnIcon}>📥</Text>
    <Text style={styles.backupBtnTextOutline}>导入数据</Text>
  </Pressable>
</View>
```

Add these styles:
```ts
backupDivider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 16, marginTop: 32 },
backupRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 12 },
backupBtn: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  paddingVertical: 14,
  borderRadius: 12,
  backgroundColor: '#FF6B35',
},
backupBtnOutline: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  paddingVertical: 14,
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  borderWidth: 1.5,
  borderColor: '#FF6B35',
},
backupBtnIcon: { fontSize: 16 },
backupBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
backupBtnTextOutline: { color: '#FF6B35', fontSize: 15, fontWeight: '700' },
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/stats/index.tsx
git commit -m "feat: add export/import buttons to stats page"
```

---

### Task 10: Final verification and TypeScript check

- [ ] **Step 1: Run TypeScript check on full project**

Run: `npx tsc --noEmit`
Expected: No errors across all files.

- [ ] **Step 2: Run existing tests**

Run: `npx jest --passWithNoTests`
Expected: All existing tests pass.

- [ ] **Step 3: Verify all files exist and are committed**

Run: `git status`
Expected: Clean working tree.

- [ ] **Step 4: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: final verification — all features implemented"
```

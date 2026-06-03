import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useExerciseStore } from '@/stores/useExerciseStore';
import { useTemplateStore } from '@/stores/useTemplateStore';
import { useCustomStandardStore } from '@/stores/useCustomStandardStore';
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

  const [segment, setSegment] = useState<'exercises' | 'templates' | 'standards'>('exercises');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState<string | null>(null);
  const [showAddStandard, setShowAddStandard] = useState(false);
  const [newStandardName, setNewStandardName] = useState('');
  const { standards, addStandard, removeStandard } = useCustomStandardStore();

  useEffect(() => {
    loadExercises();
    loadCategories();
    loadTemplates();
    useCustomStandardStore.getState().loadStandards();
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
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
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
        <Pressable
          style={[styles.segmentBtn, segment === 'standards' && styles.segmentBtnActive]}
          onPress={() => setSegment('standards')}
        >
          <Text style={[styles.segmentText, segment === 'standards' && styles.segmentTextActive]}>
            标准
          </Text>
        </Pressable>
      </View>

      {segment === 'exercises' && (
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
            renderItem={({ item }) => (
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
      )}
      {segment === 'templates' && (
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
      {segment === 'standards' && (
        <>
          <FlatList
            data={standards}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.templateCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.templateName}>{item.name}</Text>
                  <Pressable onPress={() => removeStandard(item.id)}>
                    <Text style={{ color: '#FF6B35', fontSize: 16, fontWeight: '700' }}>✕</Text>
                  </Pressable>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <EmptyState icon="📏" title="还没有自定义标准" subtitle="添加你的训练标准，如：力竭、慢放等" />
            }
            contentContainerStyle={standards.length === 0 ? styles.emptyList : { paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
          />

          {showAddStandard ? (
            <View style={styles.addPanel}>
              <View style={styles.addPanelHandle} />
              <Text style={styles.addPanelTitle}>添加自定义标准</Text>
              <TextInput
                style={styles.addInput}
                placeholder="标准名称（如：力竭）"
                placeholderTextColor="#999"
                value={newStandardName}
                onChangeText={setNewStandardName}
                autoFocus
              />
              <View style={styles.addButtons}>
                <Pressable style={styles.cancelBtn} onPress={() => setShowAddStandard(false)}>
                  <Text style={styles.cancelText}>取消</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={() => {
                  if (newStandardName.trim()) {
                    addStandard(newStandardName.trim());
                    setNewStandardName('');
                    setShowAddStandard(false);
                  }
                }}>
                  <Text style={styles.saveText}>保存标准</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.fab} onPress={() => setShowAddStandard(true)}>
              <Text style={styles.fabIcon}>+</Text>
              <Text style={styles.fabText}>添加标准</Text>
            </Pressable>
          )}
        </>
      )}

      <ConfirmDialog
        visible={deleteTemplateTarget !== null}
        title="删除模板"
        message="此模板将被永久删除，确认？"
        onConfirm={() => handleDeleteTemplate(deleteTemplateTarget!)}
        onCancel={() => setDeleteTemplateTarget(null)}
      />
    </View>
    </KeyboardAvoidingView>
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

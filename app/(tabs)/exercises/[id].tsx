import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Modal, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useExerciseStore } from '@/stores/useExerciseStore';
import { useTrainingStore } from '@/stores/useTrainingStore';
import { SessionWithExercise } from '@/db/sessions';
import { ExerciseCard } from '@/components/ExerciseCard';
import { VideoCard } from '@/components/VideoCard';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { addVideo, getVideosByExercise, deleteVideo, ExerciseVideo } from '@/db/videos';
import { detectPlatform } from '@/utils/videoPlatform';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const getById = useExerciseStore((s) => s.getById);
  const exercise = getById(id);

  const [sessions, setSessions] = useState<SessionWithExercise[]>([]);
  const [videos, setVideos] = useState<ExerciseVideo[]>([]);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const sess = useTrainingStore.getState().loadSessionsByExercise(id);
    setSessions(sess);
    setVideos(getVideosByExercise(id));
  }, [id]);

  const handleAddVideo = () => {
    if (!videoUrl.trim()) return;
    addVideo({
      exercise_id: id,
      url: videoUrl.trim(),
      platform: detectPlatform(videoUrl.trim()),
      title: videoTitle.trim(),
    });
    setVideoUrl('');
    setVideoTitle('');
    setShowAddVideo(false);
    setVideos(getVideosByExercise(id));
  };

  const handleDeleteVideo = () => {
    if (deleteVideoId) {
      deleteVideo(deleteVideoId);
      setDeleteVideoId(null);
      setVideos(getVideosByExercise(id));
    }
  };

  if (!exercise) {
    return <EmptyState icon="🔍" title="动作不存在" />;
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Pressable onPress={() => { setEditName(exercise.name); setEditCategory(exercise.category || ''); setEditModal(true); }}>
        <View style={styles.heroSection}>
          <Text style={styles.heroName}>{exercise.name}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{exercise.category}</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>训练历史</Text>
        {sessions.length > 0 && (
          <Text style={styles.sectionCount}>{sessions.length} 次</Text>
        )}
      </View>
      {sessions.length === 0 ? (
        <EmptyState
          icon="📋"
          title="暂无训练记录"
          subtitle="在训练日历中开始你的第一次训练"
        />
      ) : (
        sessions.map((s) => (
          <ExerciseCard
            key={s.id}
            name={s.date}
            category={`${exercise.name}`}
            onPress={() => router.push(`/(tabs)/calendar/session/${s.id}`)}
          />
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>训练心得</Text>
      </View>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        multiline
        textAlignVertical="top"
        placeholder="记录这个动作的训练心得..."
        placeholderTextColor="#999"
      />
      <Pressable style={styles.saveNotesBtn} onPress={() => {
        useExerciseStore.getState().editExercise(exercise.id, { notes: notes.trim() });
      }}>
        <Text style={styles.saveNotesBtnText}>保存笔记</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>参考视频</Text>
      </View>
      {videos.map((v) => (
        <VideoCard
          key={v.id}
          url={v.url}
          title={v.title}
          onDelete={() => setDeleteVideoId(v.id)}
        />
      ))}
      {videos.length === 0 && (
        <EmptyState icon="🎬" title="还没有参考视频" subtitle="添加 B站 / 抖音 教学视频链接" />
      )}

      {showAddVideo ? (
        <View style={styles.addPanel}>
          <TextInput
            style={styles.addInput}
            placeholder="视频链接（B站 / 抖音 / YouTube）"
            placeholderTextColor="#999"
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
            autoFocus
          />
          <TextInput
            style={styles.addInput}
            placeholder="标题（选填）"
            placeholderTextColor="#999"
            value={videoTitle}
            onChangeText={setVideoTitle}
          />
          <View style={styles.addButtons}>
            <Pressable style={styles.cancelBtn} onPress={() => setShowAddVideo(false)}>
              <Text style={styles.cancelText}>取消</Text>
            </Pressable>
            <Pressable style={styles.saveBtnSmall} onPress={handleAddVideo}>
              <Text style={styles.saveTextSmall}>添加</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.addVideoBtn} onPress={() => setShowAddVideo(true)}>
          <Text style={styles.addVideoBtnText}>+ 添加视频</Text>
        </Pressable>
      )}

      <ConfirmDialog
        visible={deleteVideoId !== null}
        title="删除视频"
        message="确认删除该视频参考？"
        onConfirm={handleDeleteVideo}
        onCancel={() => setDeleteVideoId(null)}
      />

      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>编辑动作</Text>
            <TextInput
              style={styles.addInput}
              placeholder="动作名称"
              placeholderTextColor="#999"
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
            <TextInput
              style={styles.addInput}
              placeholder="分类（选填）"
              placeholderTextColor="#999"
              value={editCategory}
              onChangeText={setEditCategory}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={styles.cancelText}>取消</Text>
              </Pressable>
              <Pressable style={styles.saveBtnSmall} onPress={() => {
                useExerciseStore.getState().editExercise(exercise.id, {
                  name: editName.trim(),
                  category: editCategory.trim() || undefined,
                });
                setEditModal(false);
              }}>
                <Text style={styles.saveTextSmall}>保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  heroName: { fontSize: 26, fontWeight: '800', color: '#111111', letterSpacing: 1 },
  heroBadge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
  },
  heroBadgeText: { fontSize: 13, color: '#FF6B35', fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111111' },
  sectionCount: { fontSize: 13, color: '#FF6B35', fontWeight: '600' },
  addPanel: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  addInput: {
    backgroundColor: '#F0F0F0',
    color: '#111111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  addButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  cancelText: { color: '#777777', fontSize: 14 },
  saveBtnSmall: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  saveTextSmall: { color: '#fff', fontSize: 14, fontWeight: '600' },
  addVideoBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 14,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  addVideoBtnText: { color: '#FF6B35', fontSize: 14, fontWeight: '600' },
  notesInput: {
    marginHorizontal: 16,
    backgroundColor: '#F0F0F0',
    color: '#111111',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  saveNotesBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  saveNotesBtnText: { color: '#FF6B35', fontSize: 14, fontWeight: '600' },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
});

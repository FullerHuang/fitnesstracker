import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getSessionById, updateSessionNotes, deleteSession, SessionWithExercise } from '@/db/sessions';
import { getSetsBySession, updateSet, deleteSet, TrainingSet } from '@/db/sets';
import { getImagesBySession, addImage, deleteImage, SessionImage } from '@/db/notes';
import { getVideosBySession, deleteVideo, addVideo, ExerciseVideo } from '@/db/videos';
import { SetRow, SetData } from '@/components/SetRow';
import { VideoCard } from '@/components/VideoCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { detectPlatform } from '@/utils/videoPlatform';

export default function SessionDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionWithExercise | null>(null);
  const [sets, setSets] = useState<TrainingSet[]>([]);
  const [images, setImages] = useState<SessionImage[]>([]);
  const [videos, setVideos] = useState<ExerciseVideo[]>([]);
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);

  useEffect(() => {
    const sess = getSessionById(sessionId);
    setSession(sess);
    setSets(getSetsBySession(sessionId));
    setImages(getImagesBySession(sessionId));
    setVideos(getVideosBySession(sessionId));
    if (sess) setNotes(sess.notes);
  }, [sessionId]);

  const refreshSets = () => setSets(getSetsBySession(sessionId));
  const refreshImages = () => setImages(getImagesBySession(sessionId));
  const refreshVideos = () => setVideos(getVideosBySession(sessionId));

  const handleSaveNotes = () => {
    updateSessionNotes(sessionId, notes);
    Alert.alert('已保存', '笔记已更新');
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      addImage(sessionId, result.assets[0].uri);
      refreshImages();
    }
  };

  const handleDeleteImage = () => {
    if (deleteImageId) {
      deleteImage(deleteImageId);
      setDeleteImageId(null);
      refreshImages();
    }
  };

  const handleAddVideo = () => {
    if (!videoUrl.trim()) return;
    addVideo({
      session_id: sessionId,
      url: videoUrl.trim(),
      platform: detectPlatform(videoUrl.trim()),
      title: videoTitle.trim(),
    });
    setVideoUrl('');
    setVideoTitle('');
    setShowAddVideo(false);
    refreshVideos();
  };

  const handleDeleteVideo = () => {
    if (deleteVideoId) {
      deleteVideo(deleteVideoId);
      setDeleteVideoId(null);
      refreshVideos();
    }
  };

  const handleSetChange = (index: number, data: SetData) => {
    const set = sets[index];
    updateSet(set.id, {
      target_weight: data.target_weight,
      target_reps: data.target_reps,
      target_rpe: data.target_rpe,
      weight: data.weight,
      reps: data.reps,
      rpe: data.rpe,
      custom_fields: JSON.stringify(data.custom_fields),
    });
    refreshSets();
  };

  const handleSetDelete = (id: string) => {
    deleteSet(id);
    refreshSets();
  };

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#111111', textAlign: 'center', marginTop: 40 }}>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={styles.hero}>
        <Text style={styles.heroName}>{session.exercise_name}</Text>
        <View style={styles.heroMeta}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{session.category}</Text>
          </View>
          <Text style={styles.heroDate}>{session.date}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>训练组数</Text>
        <Text style={styles.sectionCount}>{sets.length} 组</Text>
      </View>
      {sets.length === 0 ? (
        <Text style={styles.emptyHint}>暂无组数据</Text>
      ) : (
        sets.map((s, i) => (
          <SetRow
            key={s.id}
            set={{
              set_number: s.set_number,
              target_weight: s.target_weight,
              target_reps: s.target_reps,
              target_rpe: s.target_rpe,
              weight: s.weight,
              reps: s.reps,
              rpe: s.rpe,
              custom_fields: JSON.parse(s.custom_fields),
            }}
            availableStandards={[]}
            onChange={(data) => handleSetChange(i, data)}
            onDelete={() => handleSetDelete(s.id)}
          />
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>参考视频</Text>
        {videos.length > 0 && <Text style={styles.sectionCount}>{videos.length}</Text>}
      </View>
      {videos.map((v) => (
        <VideoCard
          key={v.id}
          url={v.url}
          title={v.title}
          onDelete={() => setDeleteVideoId(v.id)}
        />
      ))}
      {showAddVideo ? (
        <View style={styles.addPanel}>
          <TextInput
            style={styles.addInput}
            placeholder="视频链接"
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
        <Pressable style={styles.addBtn} onPress={() => setShowAddVideo(true)}>
          <Text style={styles.addBtnText}>+ 添加视频</Text>
        </Pressable>
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
        placeholder="记录这次训练的心得..."
        placeholderTextColor="#999"
      />
      <Pressable style={styles.saveNotesBtn} onPress={handleSaveNotes}>
        <Text style={styles.saveNotesBtnText}>保存笔记</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>照片</Text>
        {images.length > 0 && <Text style={styles.sectionCount}>{images.length}</Text>}
      </View>
      <View style={styles.imageGrid}>
        {images.map((img) => (
          <Pressable key={img.id} onLongPress={() => setDeleteImageId(img.id)}>
            <Image source={{ uri: img.uri }} style={styles.thumb} />
          </Pressable>
        ))}
        <Pressable style={styles.addImageBtn} onPress={handlePickImage}>
          <Text style={styles.addImageBtnText}>+</Text>
        </Pressable>
      </View>

      <Pressable style={styles.deleteSessionBtn} onPress={() => setShowDeleteConfirm(true)}>
        <Text style={styles.deleteSessionText}>删除此训练记录</Text>
      </Pressable>

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="删除训练记录"
        message="确认删除该次训练的所有组数、视频、笔记和照片？此操作不可撤销。"
        onConfirm={() => {
          deleteSession(sessionId);
          router.back();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <ConfirmDialog
        visible={deleteVideoId !== null}
        title="删除视频"
        message="确认删除该视频参考？"
        onConfirm={handleDeleteVideo}
        onCancel={() => setDeleteVideoId(null)}
      />
      <ConfirmDialog
        visible={deleteImageId !== null}
        title="删除照片"
        message="确认删除该照片？"
        onConfirm={handleDeleteImage}
        onCancel={() => setDeleteImageId(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  hero: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  heroName: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
  },
  heroBadgeText: { fontSize: 12, color: '#FF6B35', fontWeight: '600' },
  heroDate: { fontSize: 14, color: '#777777' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111111' },
  sectionCount: { fontSize: 13, color: '#FF6B35', fontWeight: '600' },
  emptyHint: { color: '#999999', textAlign: 'center', padding: 16, fontSize: 14 },
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
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  thumb: { width: 80, height: 80, borderRadius: 10 },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  addImageBtnText: { color: '#FF6B35', fontSize: 32, fontWeight: '300' },
  deleteSessionBtn: {
    margin: 16,
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1a0f0f',
    borderWidth: 1,
    borderColor: '#FF6B35',
    alignItems: 'center',
  },
  deleteSessionText: { color: '#FF6B35', fontSize: 15, fontWeight: '600' },
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
  addBtn: {
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
  addBtnText: { color: '#FF6B35', fontSize: 14, fontWeight: '600' },
});

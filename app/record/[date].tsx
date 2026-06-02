import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useExerciseStore } from '@/stores/useExerciseStore';
import { useTrainingStore } from '@/stores/useTrainingStore';
import { SetEditor } from '@/components/SetEditor';
import { SetData } from '@/components/SetRow';
import { addVideo } from '@/db/videos';
import { detectPlatform } from '@/utils/videoPlatform';

export default function RecordScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { exercises, loadExercises } = useExerciseStore();
  const { loadSessionsByDate } = useTrainingStore();

  const [step, setStep] = useState<'select' | 'record'>('select');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [sets, setSets] = useState<SetData[]>([]);
  const [notes, setNotes] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const handleStart = () => {
    if (!selectedExerciseId) {
      Alert.alert('请选择一个动作');
      return;
    }
    setStep('record');
    setSets([{ set_number: 1, weight: 0, reps: 0, rpe: null, is_pr: false }]);
  };

  const handleSave = () => {
    if (!selectedExerciseId) return;
    const validSets = sets.filter((s) => s.weight > 0 || s.reps > 0);
    if (validSets.length === 0) {
      Alert.alert('请至少录入一组有效数据', '每组至少需要填写重量或次数');
      return;
    }

    const { addSession, addSet, updateNotes } = useTrainingStore.getState();
    const session = addSession(selectedExerciseId, date);

    validSets.forEach((s) => {
      addSet({
        session_id: session.id,
        set_number: s.set_number,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
        is_pr: s.is_pr,
      });
    });

    if (notes.trim()) {
      updateNotes(session.id, notes.trim());
    }

    if (videoUrl.trim()) {
      addVideo({
        session_id: session.id,
        url: videoUrl.trim(),
        platform: detectPlatform(videoUrl.trim()),
        title: videoTitle.trim(),
      });
    }

    loadSessionsByDate(date);
    router.back();
  };

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  if (step === 'select') {
    return (
      <View style={styles.container}>
        <Text style={styles.stepIndicator}>第 1 步 / 共 2 步</Text>
        <Text style={styles.stepTitle}>选择训练动作</Text>
        <Text style={styles.stepSubtitle}>{date}</Text>

        <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 120 }}>
          {exercises.map((ex) => {
            const active = selectedExerciseId === ex.id;
            return (
              <Pressable
                key={ex.id}
                style={[styles.exerciseItem, active && styles.exerciseItemActive]}
                onPress={() => setSelectedExerciseId(ex.id)}
              >
                <View style={styles.exerciseLeft}>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.exerciseCat}>{ex.category}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={[styles.nextBtn, !selectedExerciseId && styles.nextBtnDisabled]}
            onPress={handleStart}
          >
            <Text style={styles.nextBtnText}>
              {selectedExercise
                ? `开始记录 · ${selectedExercise.name}`
                : '请先选择动作'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.stepIndicator}>第 2 步 / 共 2 步</Text>
      <Text style={styles.stepTitle}>{selectedExercise?.name}</Text>
      <Text style={styles.stepSubtitle}>{date}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>训练组数</Text>
        <SetEditor sets={sets} onChangeSets={setSets} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>视频参考</Text>
        <View style={styles.videoRow}>
          <TextInput
            style={styles.addInput}
            placeholder="视频链接（选填）"
            placeholderTextColor="#999"
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.addInputSmall}
            placeholder="标题"
            placeholderTextColor="#999"
            value={videoTitle}
            onChangeText={setVideoTitle}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>训练心得</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="记录这次训练的心得感受..."
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.bottomButtons}>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>放弃</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>保存训练</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
    marginTop: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  list: { flex: 1 },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  exerciseItemActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#F0F0F0',
  },
  exerciseLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: { borderColor: '#FF6B35' },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
  },
  exerciseName: { fontSize: 16, fontWeight: '600', color: '#111111' },
  exerciseCat: { fontSize: 12, color: '#777777', marginTop: 2 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#F0F0F0' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  videoRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  addInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    color: '#111111',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  addInputSmall: {
    width: 80,
    backgroundColor: '#F0F0F0',
    color: '#111111',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  notesInput: {
    marginHorizontal: 16,
    backgroundColor: '#F0F0F0',
    color: '#111111',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  cancelText: { color: '#111111', fontSize: 15, fontWeight: '500' },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
  },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

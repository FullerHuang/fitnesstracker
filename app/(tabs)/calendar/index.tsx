import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { useTrainingStore } from '@/stores/useTrainingStore';
import { useTemplateStore } from '@/stores/useTemplateStore';
import { getDatesWithSessions } from '@/db/sessions';
import { getSetsBySession } from '@/db/sets';
import { TemplateExercise } from '@/db/templates';
import { ExerciseCard } from '@/components/ExerciseCard';
import { EmptyState } from '@/components/EmptyState';

export default function CalendarScreen() {
  const router = useRouter();
  const { selectedDate, setSelectedDate } = useCalendarStore();
  const { currentSessions, loadSessionsByDate } = useTrainingStore();
  const { addTemplate } = useTemplateStore();
  const [markedDates, setMarkedDates] = useState<Record<string, { marked: boolean }>>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    try {
      const dates = getDatesWithSessions();
      const marks: Record<string, { marked: boolean }> = {};
      dates.forEach((d) => {
        marks[d] = { marked: true };
      });
      setMarkedDates(marks);
    } catch {
      setMarkedDates({});
    }
  }, [selectedDate, currentSessions]);

  useEffect(() => {
    loadSessionsByDate(selectedDate);
  }, [selectedDate]);

  const onDayPress = useCallback(
    (day: DateData) => {
      setSelectedDate(day.dateString);
    },
    []
  );

  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

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
      })),
    }));
    addTemplate(templateName.trim(), data);
    setShowTemplateModal(false);
    Alert.alert('保存成功', `模板「${templateName.trim()}」已保存`);
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: '#FF6B35',
          },
        }}
        theme={{
          backgroundColor: '#F8F9FA',
          calendarBackground: '#F8F9FA',
          textSectionTitleColor: '#777777',
          textSectionTitleDisabledColor: '#CCCCCC',
          selectedDayBackgroundColor: '#FF6B35',
          selectedDayTextColor: '#fff',
          todayTextColor: '#FF6B35',
          todayBackgroundColor: 'transparent',
          dayTextColor: '#111111',
          textDisabledColor: '#CCCCCC',
          dotColor: '#FF6B35',
          selectedDotColor: '#fff',
          arrowColor: '#FF6B35',
          disabledArrowColor: '#DDDDDD',
          monthTextColor: '#111111',
          indicatorColor: '#FF6B35',
          textDayFontWeight: '400',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 12,
        }}
        style={styles.calendar}
      />

      <View style={styles.divider} />

      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.dayTitle}>{selectedDate}</Text>
          {isToday && <Text style={styles.todayBadge}>今天</Text>}
        </View>
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
      </View>

      <ScrollView
        style={styles.sessionList}
        contentContainerStyle={
          currentSessions.length === 0 ? styles.emptyList : { paddingBottom: 20 }
        }
      >
        {currentSessions.length === 0 ? (
          <EmptyState
            icon="🏃"
            title="当天没有训练记录"
            subtitle="点击「记录训练」开始挥汗"
          />
        ) : (
          currentSessions.map((s) => (
            <ExerciseCard
              key={s.id}
              name={s.exercise_name}
              category={s.category}
              onPress={() => router.push(`/(tabs)/calendar/session/${s.id}`)}
            />
          ))
        )}
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  calendar: {
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
  },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 16, marginTop: 4 },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dayTitle: { fontSize: 18, fontWeight: '700', color: '#111111' },
  todayBadge: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 2,
  },
  dayHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  startBtnIcon: { color: '#fff', fontSize: 18, fontWeight: '300' },
  startBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  templateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  templateBtnText: { color: '#111111', fontSize: 14, fontWeight: '600' },
  sessionList: { flex: 1 },
  emptyList: { flexGrow: 1 },
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
});

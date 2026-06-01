import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { useTrainingStore } from '@/stores/useTrainingStore';
import { getDatesWithSessions } from '@/db/sessions';
import { ExerciseCard } from '@/components/ExerciseCard';
import { EmptyState } from '@/components/EmptyState';

export default function CalendarScreen() {
  const router = useRouter();
  const { selectedDate, setSelectedDate } = useCalendarStore();
  const { currentSessions, loadSessionsByDate } = useTrainingStore();
  const [markedDates, setMarkedDates] = useState<Record<string, { marked: boolean }>>({});

  useEffect(() => {
    const dates = getDatesWithSessions();
    const marks: Record<string, { marked: boolean }> = {};
    dates.forEach((d) => {
      marks[d] = { marked: true };
    });
    setMarkedDates(marks);
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
            selectedColor: '#e94560',
          },
        }}
        theme={{
          backgroundColor: '#1a1a2e',
          calendarBackground: '#1a1a2e',
          textSectionTitleColor: '#8a8a8a',
          textSectionTitleDisabledColor: '#333',
          selectedDayBackgroundColor: '#e94560',
          selectedDayTextColor: '#fff',
          todayTextColor: '#e94560',
          todayBackgroundColor: 'transparent',
          dayTextColor: '#e0e0e0',
          textDisabledColor: '#333',
          dotColor: '#e94560',
          selectedDotColor: '#fff',
          arrowColor: '#e94560',
          disabledArrowColor: '#333',
          monthTextColor: '#e0e0e0',
          indicatorColor: '#e94560',
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
        <Pressable
          style={styles.startBtn}
          onPress={() => router.push(`/record/${selectedDate}`)}
        >
          <Text style={styles.startBtnIcon}>+</Text>
          <Text style={styles.startBtnText}>记录训练</Text>
        </Pressable>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  calendar: {
    paddingHorizontal: 8,
    backgroundColor: '#1a1a2e',
  },
  divider: { height: 1, backgroundColor: '#0f3460', marginHorizontal: 16, marginTop: 4 },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dayTitle: { fontSize: 18, fontWeight: '700', color: '#e0e0e0' },
  todayBadge: {
    fontSize: 11,
    color: '#e94560',
    fontWeight: '600',
    marginTop: 2,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#e94560',
    borderRadius: 10,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  startBtnIcon: { color: '#fff', fontSize: 18, fontWeight: '300' },
  startBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sessionList: { flex: 1 },
  emptyList: { flexGrow: 1 },
});

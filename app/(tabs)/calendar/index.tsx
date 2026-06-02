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
  sessionList: { flex: 1 },
  emptyList: { flexGrow: 1 },
});

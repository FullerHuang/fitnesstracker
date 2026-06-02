import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeDatabase } from '@/db/database';
import { seedDefaultExercises } from '@/db/exercises';
import { DEFAULT_EXERCISES } from '@/constants/defaultExercises';

export default function RootLayout() {
  useEffect(() => {
    try {
      initializeDatabase();
      seedDefaultExercises(DEFAULT_EXERCISES);
    } catch (e) {
      console.error('App init failed:', e);
    }
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="record/[date]"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '开始训练',
            headerStyle: { backgroundColor: '#F8F9FA' },
            headerTintColor: '#111111',
          }}
        />
      </Stack>
    </>
  );
}

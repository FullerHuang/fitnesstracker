import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeDatabase } from '@/db/database';
import { seedDefaultExercises } from '@/db/exercises';
import { DEFAULT_EXERCISES } from '@/constants/defaultExercises';

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase();
    seedDefaultExercises(DEFAULT_EXERCISES);
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="record/[date]"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '开始训练',
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#e0e0e0',
          }}
        />
      </Stack>
    </>
  );
}

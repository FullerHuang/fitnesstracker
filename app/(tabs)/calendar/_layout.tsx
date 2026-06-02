import { Stack } from 'expo-router';

export default function CalendarLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#F8F9FA' },
        headerTintColor: '#111111',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: '训练日历' }} />
      <Stack.Screen name="session/[sessionId]" options={{ headerTitle: '训练详情' }} />
    </Stack>
  );
}

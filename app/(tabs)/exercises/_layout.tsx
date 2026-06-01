import { Stack } from 'expo-router';

export default function ExercisesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#e0e0e0',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: '动作库' }} />
      <Stack.Screen name="[id]" options={{ headerTitle: '动作详情' }} />
    </Stack>
  );
}

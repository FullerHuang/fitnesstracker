import { Stack } from 'expo-router';

export default function ExercisesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#F8F9FA' },
        headerTintColor: '#111111',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: '动作库' }} />
      <Stack.Screen name="[id]" options={{ headerTitle: '动作详情' }} />
    </Stack>
  );
}

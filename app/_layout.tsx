import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
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

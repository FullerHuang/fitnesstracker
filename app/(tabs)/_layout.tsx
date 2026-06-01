import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#8a8a8a',
        tabBarStyle: {
          backgroundColor: '#16213e',
          borderTopColor: '#0f3460',
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="exercises"
        options={{
          title: '动作库',
          tabBarLabel: '动作库',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '训练日历',
          tabBarLabel: '训练',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '统计分析',
          tabBarLabel: '统计',
        }}
      />
    </Tabs>
  );
}

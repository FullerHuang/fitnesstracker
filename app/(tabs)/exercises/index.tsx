import { View, Text, StyleSheet } from 'react-native';

export default function ExercisesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>动作库</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#e0e0e0', fontSize: 18 },
});

import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Props {
  name: string;
  category: string;
  sessionCount?: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ExerciseCard({ name, category, sessionCount, onPress, onLongPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.left}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.category}>{category}</Text>
      </View>
      {sessionCount !== undefined ? (
        <View style={styles.right}>
          <Text style={styles.count}>{sessionCount}</Text>
          <Text style={styles.countLabel}>次训练</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#16213e',
    borderRadius: 10,
  },
  left: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#e0e0e0' },
  category: { fontSize: 12, color: '#8a8a8a', marginTop: 2 },
  right: { alignItems: 'center' },
  count: { fontSize: 20, fontWeight: '700', color: '#e94560' },
  countLabel: { fontSize: 11, color: '#8a8a8a' },
});

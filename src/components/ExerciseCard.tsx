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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  left: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#111111' },
  category: { fontSize: 12, color: '#777777', marginTop: 2 },
  right: { alignItems: 'center' },
  count: { fontSize: 20, fontWeight: '700', color: '#FF6B35' },
  countLabel: { fontSize: 11, color: '#777777' },
});

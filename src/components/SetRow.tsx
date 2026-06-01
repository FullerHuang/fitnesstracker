import { View, Text, TextInput, Switch, StyleSheet } from 'react-native';

export interface SetData {
  set_number: number;
  weight: number;
  reps: number;
  rpe: number | null;
  is_pr: boolean;
}

interface Props {
  set: SetData;
  onChange: (data: SetData) => void;
  onDelete: () => void;
}

export function SetRow({ set, onChange, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.setNum}>第{set.set_number}组</Text>
      <View style={styles.field}>
        <Text style={styles.label}>重量(kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={set.weight > 0 ? String(set.weight) : ''}
          placeholder="0"
          placeholderTextColor="#555"
          onChangeText={(v) => onChange({ ...set, weight: parseFloat(v) || 0 })}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>次数</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={set.reps > 0 ? String(set.reps) : ''}
          placeholder="0"
          placeholderTextColor="#555"
          onChangeText={(v) => onChange({ ...set, reps: parseInt(v) || 0 })}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>RPE</Text>
        <TextInput
          style={[styles.input, styles.inputSmall]}
          keyboardType="numeric"
          value={set.rpe !== null ? String(set.rpe) : ''}
          placeholder="-"
          placeholderTextColor="#555"
          onChangeText={(v) => onChange({ ...set, rpe: v ? parseFloat(v) : null })}
        />
      </View>
      <View style={styles.prRow}>
        <Text style={styles.label}>PR</Text>
        <Switch
          value={set.is_pr}
          onValueChange={(v) => onChange({ ...set, is_pr: v })}
          trackColor={{ false: '#333', true: '#e94560' }}
        />
      </View>
      <Text style={styles.deleteBtn} onPress={onDelete}>
        X
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    marginHorizontal: 16,
    marginVertical: 2,
    backgroundColor: '#16213e',
    borderRadius: 8,
  },
  setNum: { width: 40, fontSize: 12, color: '#8a8a8a' },
  field: { alignItems: 'center' },
  label: { fontSize: 10, color: '#8a8a8a', marginBottom: 2 },
  input: {
    backgroundColor: '#0f3460',
    color: '#e0e0e0',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    width: 60,
    fontSize: 14,
    textAlign: 'center',
  },
  inputSmall: { width: 44 },
  prRow: { alignItems: 'center' },
  deleteBtn: { color: '#e94560', fontSize: 16, fontWeight: '700', padding: 4 },
});

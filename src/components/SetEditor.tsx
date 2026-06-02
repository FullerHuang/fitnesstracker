import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SetRow, SetData } from './SetRow';

interface Props {
  sets: SetData[];
  onChangeSets: (sets: SetData[]) => void;
}

export function SetEditor({ sets, onChangeSets }: Props) {
  const addSet = () => {
    const lastWeight = sets.length > 0 ? sets[sets.length - 1].weight : 0;
    const lastReps = sets.length > 0 ? sets[sets.length - 1].reps : 0;
    onChangeSets([
      ...sets,
      {
        set_number: sets.length + 1,
        weight: lastWeight,
        reps: lastReps,
        rpe: null,
        is_pr: false,
      },
    ]);
  };

  const updateSet = (index: number, data: SetData) => {
    const updated = [...sets];
    updated[index] = data;
    onChangeSets(updated);
  };

  const removeSet = (index: number) => {
    const updated = sets
      .filter((_, i) => i !== index)
      .map((s, i) => ({
        ...s,
        set_number: i + 1,
      }));
    onChangeSets(updated);
  };

  return (
    <View style={styles.container}>
      {sets.map((s, i) => (
        <SetRow
          key={i}
          set={s}
          onChange={(data) => updateSet(i, data)}
          onDelete={() => removeSet(i)}
        />
      ))}
      <Pressable style={styles.addBtn} onPress={addSet}>
        <Text style={styles.addBtnText}>+ 添加一组</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  addBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  addBtnText: { color: '#FF6B35', fontSize: 14, fontWeight: '600' },
});

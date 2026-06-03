import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SetRow, SetData } from './SetRow';

interface Props {
  sets: SetData[];
  availableStandards: { id: string; name: string }[];
  onChangeSets: (sets: SetData[]) => void;
}

export function SetEditor({ sets, availableStandards, onChangeSets }: Props) {
  const addSet = () => {
    const last = sets.length > 0 ? sets[sets.length - 1] : null;
    onChangeSets([
      ...sets,
      {
        set_number: sets.length + 1,
        target_weight: last ? last.target_weight : 0,
        target_reps: last ? last.target_reps : 0,
        target_rpe: last ? last.target_rpe : null,
        weight: last ? last.weight : 0,
        reps: last ? last.reps : 0,
        rpe: last ? last.rpe : null,
        custom_fields: last ? last.custom_fields.map((cf) => ({ ...cf, actual: 0 })) : [],
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
      .map((s, i) => ({ ...s, set_number: i + 1 }));
    onChangeSets(updated);
  };

  return (
    <View style={styles.container}>
      {sets.map((s, i) => (
        <SetRow
          key={i}
          set={s}
          availableStandards={availableStandards}
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

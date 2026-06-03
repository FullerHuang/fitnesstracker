import { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet } from 'react-native';

export interface SetData {
  set_number: number;
  target_weight: number;
  target_reps: number;
  target_rpe: number | null;
  weight: number;
  reps: number;
  rpe: number | null;
  custom_fields: { name: string; target: number; actual: number }[];
}

interface Props {
  set: SetData;
  availableStandards: { id: string; name: string }[];
  onChange: (data: SetData) => void;
  onDelete: () => void;
}

export function SetRow({ set, availableStandards, onChange, onDelete }: Props) {
  const [showStandardPicker, setShowStandardPicker] = useState(false);

  const unusedStandards = availableStandards.filter(
    (s) => !set.custom_fields.find((cf) => cf.name === s.name)
  );

  const addCustomField = (name: string) => {
    onChange({
      ...set,
      custom_fields: [...set.custom_fields, { name, target: 0, actual: 0 }],
    });
    setShowStandardPicker(false);
  };

  const removeCustomField = (index: number) => {
    onChange({
      ...set,
      custom_fields: set.custom_fields.filter((_, i) => i !== index),
    });
  };

  const updateCustomTarget = (index: number, target: number) => {
    const updated = [...set.custom_fields];
    updated[index] = { ...updated[index], target };
    onChange({ ...set, custom_fields: updated });
  };

  const updateCustomActual = (index: number, actual: number) => {
    const updated = [...set.custom_fields];
    updated[index] = { ...updated[index], actual };
    onChange({ ...set, custom_fields: updated });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.setNum}>第{set.set_number}组</Text>
        <Text style={styles.deleteBtn} onPress={onDelete}>✕</Text>
      </View>

      {/* Target Section */}
      <Text style={styles.sectionLabel}>目标</Text>
      <View style={styles.fieldRow}>
        <View style={styles.field}>
          <Text style={styles.label}>重量(kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={set.target_weight > 0 ? String(set.target_weight) : ''}
            placeholder="0"
            placeholderTextColor="#999"
            onChangeText={(v) => onChange({ ...set, target_weight: parseFloat(v) || 0 })}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>次数</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={set.target_reps > 0 ? String(set.target_reps) : ''}
            placeholder="0"
            placeholderTextColor="#999"
            onChangeText={(v) => onChange({ ...set, target_reps: parseInt(v) || 0 })}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>RPE</Text>
          <TextInput
            style={styles.inputSmall}
            keyboardType="numeric"
            value={set.target_rpe !== null ? String(set.target_rpe) : ''}
            placeholder="-"
            placeholderTextColor="#999"
            onChangeText={(v) => onChange({ ...set, target_rpe: v ? parseFloat(v) : null })}
          />
        </View>
        {set.custom_fields.length > 0 && (
          <>
            {set.custom_fields.map((cf, i) => (
              <View key={i} style={styles.field}>
                <Text style={styles.label}>{cf.name}</Text>
                <TextInput
                  style={styles.inputSmall}
                  keyboardType="numeric"
                  value={cf.target > 0 ? String(cf.target) : ''}
                  placeholder="0"
                  placeholderTextColor="#999"
                  onChangeText={(v) => {
                    const num = parseFloat(v);
                    updateCustomTarget(i, isNaN(num) ? 0 : num);
                  }}
                />
                <Text style={styles.customRemove} onPress={() => removeCustomField(i)}>✕</Text>
              </View>
            ))}
          </>
        )}
      </View>

      {unusedStandards.length > 0 && (
        <Pressable style={styles.addCustomBtn} onPress={() => setShowStandardPicker(true)}>
          <Text style={styles.addCustomText}>+ 添加标准</Text>
        </Pressable>
      )}

      {/* Actual Section */}
      <Text style={styles.sectionLabel}>完成</Text>
      <View style={styles.fieldRow}>
        <View style={styles.field}>
          <Text style={styles.label}>重量(kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={set.weight > 0 ? String(set.weight) : ''}
            placeholder="0"
            placeholderTextColor="#999"
            onChangeText={(v) => onChange({ ...set, weight: parseFloat(v) || 0 })}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>次数</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={set.reps > 0 ? String(set.reps) : ''}
            placeholder="0"
            placeholderTextColor="#999"
            onChangeText={(v) => onChange({ ...set, reps: parseInt(v) || 0 })}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>RPE</Text>
          <TextInput
            style={styles.inputSmall}
            keyboardType="numeric"
            value={set.rpe !== null ? String(set.rpe) : ''}
            placeholder="-"
            placeholderTextColor="#999"
            onChangeText={(v) => onChange({ ...set, rpe: v ? parseFloat(v) : null })}
          />
        </View>
        {set.custom_fields.length > 0 && (
          <>
            {set.custom_fields.map((cf, i) => (
              <View key={i} style={styles.field}>
                <Text style={styles.label}>{cf.name}</Text>
                <TextInput
                  style={styles.inputSmall}
                  keyboardType="numeric"
                  value={cf.actual > 0 ? String(cf.actual) : ''}
                  placeholder="0"
                  placeholderTextColor="#999"
                  onChangeText={(v) => {
                    const num = parseFloat(v);
                    updateCustomActual(i, isNaN(num) ? 0 : num);
                  }}
                />
              </View>
            ))}
          </>
        )}
      </View>

      {/* Standard Picker Modal */}
      <Modal visible={showStandardPicker} transparent animationType="fade">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>添加标准</Text>
            {unusedStandards.map((s) => (
              <Pressable key={s.id} style={styles.pickerOption} onPress={() => addCustomField(s.name)}>
                <Text style={styles.pickerOptionText}>{s.name}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.pickerCancel} onPress={() => setShowStandardPicker(false)}>
              <Text style={styles.pickerCancelText}>取消</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  setNum: { fontSize: 14, fontWeight: '700', color: '#FF6B35' },
  deleteBtn: { color: '#FF6B35', fontSize: 16, fontWeight: '700', padding: 4 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777777',
    marginBottom: 6,
    marginTop: 4,
  },
  fieldRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  field: { alignItems: 'center' },
  label: { fontSize: 10, color: '#777777', marginBottom: 2 },
  input: {
    backgroundColor: '#F0F0F0',
    color: '#111111',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    width: 70,
    fontSize: 14,
    textAlign: 'center',
  },
  inputSmall: {
    backgroundColor: '#F0F0F0',
    color: '#111111',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    width: 50,
    fontSize: 14,
    textAlign: 'center',
  },
  customRemove: { color: '#FF6B35', fontSize: 14, fontWeight: '700', padding: 4 },
  addCustomBtn: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addCustomText: { color: '#FF6B35', fontSize: 12, fontWeight: '600' },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCard: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
  },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: '#111111', marginBottom: 12, textAlign: 'center' },
  pickerOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerOptionText: { fontSize: 15, color: '#111111' },
  pickerCancel: { marginTop: 12, alignItems: 'center' },
  pickerCancelText: { color: '#777777', fontSize: 14 },
});

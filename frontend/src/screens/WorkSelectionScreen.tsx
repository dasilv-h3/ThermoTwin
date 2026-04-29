import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type WorkType =
  | 'roof_insulation'
  | 'wall_insulation'
  | 'floor_insulation'
  | 'windows'
  | 'heating'
  | 'ventilation'
  | 'solar_panels'
  | 'water_heater';

type WorkOption = {
  key: WorkType;
  label: string;
  description: string;
};

const OPTIONS: WorkOption[] = [
  {
    key: 'roof_insulation',
    label: 'Isolation toiture',
    description: 'Isolation des combles ou de la toiture',
  },
  {
    key: 'wall_insulation',
    label: 'Isolation des murs',
    description: 'Isolation par l’extérieur ou l’intérieur',
  },
  {
    key: 'floor_insulation',
    label: 'Isolation plancher bas',
    description: 'Isolation sur vide sanitaire ou sous-sol',
  },
  {
    key: 'windows',
    label: 'Remplacement des fenêtres',
    description: 'Passage en double ou triple vitrage',
  },
  {
    key: 'heating',
    label: 'Système de chauffage',
    description: 'Pompe à chaleur, chaudière biomasse, etc.',
  },
  {
    key: 'ventilation',
    label: 'Ventilation',
    description: 'VMC double flux',
  },
  {
    key: 'solar_panels',
    label: 'Panneaux solaires',
    description: 'Photovoltaïque ou thermique',
  },
  {
    key: 'water_heater',
    label: 'Chauffe-eau',
    description: 'Ballon thermodynamique ou solaire',
  },
];

type Props = {
  initialSelection?: WorkType[];
  onChange?: (selected: WorkType[]) => void;
  onContinue?: (selected: WorkType[]) => void;
};

export default function WorkSelectionScreen({ initialSelection, onChange, onContinue }: Props) {
  const [selected, setSelected] = useState<Set<WorkType>>(() => new Set(initialSelection ?? []));

  const toggle = (key: WorkType) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onChange?.(Array.from(next));
      return next;
    });
  };

  const selectedCount = selected.size;
  const canContinue = useMemo(() => selectedCount > 0, [selectedCount]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quels travaux envisagez-vous ?</Text>
        <Text style={styles.subtitle}>Sélectionnez tous les postes qui vous intéressent.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {OPTIONS.map((opt) => {
          const isChecked = selected.has(opt.key);
          return (
            <Pressable
              key={opt.key}
              style={[styles.row, isChecked && styles.rowChecked]}
              onPress={() => toggle(opt.key)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
              accessibilityLabel={opt.label}
            >
              <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{opt.label}</Text>
                <Text style={styles.rowDescription}>{opt.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.counter}>
          {selectedCount} poste{selectedCount > 1 ? 's' : ''} sélectionné
          {selectedCount > 1 ? 's' : ''}
        </Text>
        <Pressable
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          onPress={() => onContinue?.(Array.from(selected))}
          disabled={!canContinue}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>Continuer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#111' },
  subtitle: { marginTop: 4, fontSize: 14, color: '#555' },
  list: { padding: 16, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e4e6ea',
    borderRadius: 12,
    gap: 12,
    backgroundColor: '#fff',
  },
  rowChecked: {
    borderColor: '#1f6feb',
    backgroundColor: '#eef4ff',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#c0c4cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1f6feb',
    borderColor: '#1f6feb',
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 16 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  rowDescription: { fontSize: 12, color: '#666', marginTop: 2 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  counter: { fontSize: 13, color: '#555' },
  cta: {
    backgroundColor: '#1f6feb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaDisabled: { backgroundColor: '#9bbcf0' },
  ctaText: { color: '#fff', fontWeight: '700' },
});

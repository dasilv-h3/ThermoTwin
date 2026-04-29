import { StyleSheet, Text, View } from 'react-native';

export type DpeClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

type Props = {
  before: DpeClass;
  after: DpeClass;
};

const CLASS_COLORS: Record<DpeClass, string> = {
  A: '#2c9a3a',
  B: '#68b738',
  C: '#c8d32f',
  D: '#f4d000',
  E: '#f08a1d',
  F: '#e4571b',
  G: '#d0201c',
};

const CLASS_ORDER: DpeClass[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

function classIndex(c: DpeClass): number {
  return CLASS_ORDER.indexOf(c);
}

function Badge({ dpeClass, label }: { dpeClass: DpeClass; label: string }) {
  return (
    <View style={styles.badgeWrapper}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <View style={[styles.badge, { backgroundColor: CLASS_COLORS[dpeClass] }]}>
        <Text style={styles.badgeLetter}>{dpeClass}</Text>
      </View>
    </View>
  );
}

export default function DpeComparator({ before, after }: Props) {
  const delta = classIndex(before) - classIndex(after);
  const deltaLabel =
    delta > 0
      ? `+${delta} classe${delta > 1 ? 's' : ''}`
      : delta < 0
        ? `${delta} classe${delta < -1 ? 's' : ''}`
        : 'Aucun gain';
  const deltaColor = delta > 0 ? '#2c9a3a' : delta < 0 ? '#d0201c' : '#666';

  return (
    <View style={styles.container} accessibilityLabel={`Évolution DPE de ${before} à ${after}`}>
      <Badge dpeClass={before} label="Avant" />
      <View style={styles.arrowBlock}>
        <Text style={styles.arrow}>→</Text>
        <Text style={[styles.delta, { color: deltaColor }]}>{deltaLabel}</Text>
      </View>
      <Badge dpeClass={after} label="Après" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fafbfc',
    borderRadius: 12,
    gap: 8,
  },
  badgeWrapper: { alignItems: 'center', gap: 6 },
  badgeLabel: { fontSize: 12, color: '#555', fontWeight: '500' },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLetter: { color: '#fff', fontSize: 28, fontWeight: '800' },
  arrowBlock: { alignItems: 'center', flex: 1 },
  arrow: { fontSize: 28, color: '#999' },
  delta: { fontSize: 12, fontWeight: '700', marginTop: 2 },
});

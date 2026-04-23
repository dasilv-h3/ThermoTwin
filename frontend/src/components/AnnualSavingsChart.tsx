import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type AnnualSavingsPoint = {
  year: number;
  savings: number;
};

type Props = {
  data: AnnualSavingsPoint[];
  height?: number;
  barColor?: string;
  currency?: string;
};

const DEFAULT_HEIGHT = 180;

function formatAmount(value: number, currency: string): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k${currency}`;
  }
  return `${Math.round(value)}${currency}`;
}

export default function AnnualSavingsChart({
  data,
  height = DEFAULT_HEIGHT,
  barColor = '#2f9e44',
  currency = '€',
}: Props) {
  const max = useMemo(() => data.reduce((m, p) => Math.max(m, p.savings), 0) || 1, [data]);

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>Aucune donnée d’économies</Text>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel="Graphique des économies annuelles"
    >
      <View style={[styles.plot, { height }]}>
        {data.map((point) => {
          const ratio = Math.max(0, point.savings) / max;
          const barHeight = Math.max(2, ratio * (height - 32));
          return (
            <View key={point.year} style={styles.column}>
              <Text style={styles.value}>{formatAmount(point.savings, currency)}</Text>
              <View style={[styles.bar, { height: barHeight, backgroundColor: barColor }]} />
              <Text style={styles.label}>{point.year}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bar: {
    width: '70%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  value: { fontSize: 11, color: '#333', fontWeight: '600' },
  label: { fontSize: 11, color: '#666', marginTop: 4 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  emptyText: { color: '#999' },
});

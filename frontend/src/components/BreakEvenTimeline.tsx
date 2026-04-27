import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  investment: number;
  annualSavings: number;
  horizonYears?: number;
  currency?: string;
};

type YearPoint = {
  year: number;
  cumulative: number;
  reachedBreakEven: boolean;
};

function formatAmount(value: number, currency: string): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k${currency}`;
  }
  return `${Math.round(value)}${currency}`;
}

export default function BreakEvenTimeline({
  investment,
  annualSavings,
  horizonYears = 15,
  currency = '€',
}: Props) {
  const { points, breakEvenYear } = useMemo(() => {
    const arr: YearPoint[] = [];
    let reached = false;
    let firstReached: number | null = null;
    for (let y = 1; y <= horizonYears; y++) {
      const cumulative = annualSavings * y;
      const atBreakEven = cumulative >= investment;
      if (atBreakEven && !reached) {
        reached = true;
        firstReached = y;
      }
      arr.push({
        year: y,
        cumulative,
        reachedBreakEven: atBreakEven,
      });
    }
    const exactBreakEven = annualSavings > 0 ? investment / annualSavings : null;
    return {
      points: arr,
      breakEvenYear:
        exactBreakEven && exactBreakEven <= horizonYears ? exactBreakEven : firstReached,
    };
  }, [investment, annualSavings, horizonYears]);

  const breakEvenLabel =
    breakEvenYear == null
      ? `> ${horizonYears} ans`
      : breakEvenYear < 1
        ? '< 1 an'
        : `${Math.round(breakEvenYear * 10) / 10} ans`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Retour sur investissement</Text>
        <View style={styles.kpi}>
          <Text style={styles.kpiValue}>{breakEvenLabel}</Text>
          <Text style={styles.kpiLabel}>avant amortissement</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Investissement</Text>
          <Text style={styles.summaryValue}>{formatAmount(investment, currency)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Économie / an</Text>
          <Text style={styles.summaryValue}>{formatAmount(annualSavings, currency)}</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {points.map((p) => (
          <View key={p.year} style={styles.year}>
            <View
              style={[styles.dot, p.reachedBreakEven ? styles.dotReached : styles.dotPending]}
            />
            <Text style={styles.yearLabel}>A{p.year}</Text>
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotPending]} />
          <Text style={styles.legendText}>Avant break-even</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotReached]} />
          <Text style={styles.legendText}>Après break-even</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fafbfc',
    borderRadius: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111' },
  kpi: { alignItems: 'flex-end' },
  kpiValue: { fontSize: 20, fontWeight: '800', color: '#2c9a3a' },
  kpiLabel: { fontSize: 11, color: '#666' },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 11, color: '#666' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#222', marginTop: 2 },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  year: { alignItems: 'center', flex: 1, gap: 4 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotPending: { backgroundColor: '#ddd' },
  dotReached: { backgroundColor: '#2c9a3a' },
  yearLabel: { fontSize: 9, color: '#777' },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 11, color: '#555' },
});

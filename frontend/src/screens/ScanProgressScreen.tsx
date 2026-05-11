import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

export type ScanPhase = 'preparing' | 'capturing' | 'reconstructing' | 'analyzing' | 'done';

export type ScanProgress = {
  phase: ScanPhase;
  percent: number;
  pointsCaptured?: number;
  coverage?: number;
};

type Props = {
  progress: ScanProgress;
  estimatedSeconds?: number;
};

const PHASE_LABELS: Record<ScanPhase, string> = {
  preparing: 'Préparation du capteur',
  capturing: 'Capture de la pièce',
  reconstructing: 'Reconstruction 3D',
  analyzing: 'Analyse thermique',
  done: 'Terminé',
};

const PHASE_ORDER: ScanPhase[] = ['preparing', 'capturing', 'reconstructing', 'analyzing', 'done'];

export default function ScanProgressScreen({ progress, estimatedSeconds }: Props) {
  const clamped = Math.max(0, Math.min(100, progress.percent));
  const [widthAnim] = useState(() => new Animated.Value(clamped));
  const [remaining, setRemaining] = useState<number | null>(estimatedSeconds ?? null);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clamped,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [clamped, widthAnim]);

  useEffect(() => {
    if (remaining == null || remaining <= 0 || progress.phase === 'done') {
      return;
    }
    const id = setInterval(() => {
      setRemaining((r) => (r == null ? null : Math.max(0, r - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [remaining, progress.phase]);

  const phaseIndex = PHASE_ORDER.indexOf(progress.phase);
  const progressLabel = useMemo(() => `${Math.round(clamped)} %`, [clamped]);
  const remainingLabel =
    remaining == null ? '' : remaining <= 0 ? 'Finalisation…' : `~${remaining}s restantes`;

  const barWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Text style={styles.title}>Scan en cours</Text>
      <Text style={styles.phase}>{PHASE_LABELS[progress.phase]}</Text>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.percent}>{progressLabel}</Text>
        {remainingLabel ? <Text style={styles.remaining}>{remainingLabel}</Text> : null}
      </View>

      {progress.pointsCaptured != null || progress.coverage != null ? (
        <View style={styles.statsRow}>
          {progress.pointsCaptured != null ? (
            <Stat label="Points capturés" value={progress.pointsCaptured.toLocaleString('fr-FR')} />
          ) : null}
          {progress.coverage != null ? (
            <Stat label="Couverture" value={`${Math.round(progress.coverage)} %`} />
          ) : null}
        </View>
      ) : null}

      <View style={styles.phases}>
        {PHASE_ORDER.map((p, i) => {
          const active = i === phaseIndex;
          const done = i < phaseIndex || progress.phase === 'done';
          return (
            <View key={p} style={styles.phaseItem}>
              <View
                style={[
                  styles.phaseDot,
                  done && styles.phaseDotDone,
                  active && styles.phaseDotActive,
                ]}
              />
              <Text style={[styles.phaseLabel, (active || done) && styles.phaseLabelActive]}>
                {PHASE_LABELS[p]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 24, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  phase: { color: '#9bbcf0', fontSize: 14, marginTop: 4, marginBottom: 20 },
  barTrack: { height: 10, backgroundColor: '#1c2a45', borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#2f9e44' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  percent: { color: '#fff', fontSize: 14, fontWeight: '700' },
  remaining: { color: '#9bbcf0', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 20 },
  stat: { flex: 1, backgroundColor: '#14213d', padding: 12, borderRadius: 10 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#9bbcf0', fontSize: 11, marginTop: 2 },
  phases: { marginTop: 28, gap: 10 },
  phaseItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  phaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2a3c5e',
  },
  phaseDotDone: { backgroundColor: '#2f9e44' },
  phaseDotActive: { backgroundColor: '#f5c518' },
  phaseLabel: { color: '#5d6e8e', fontSize: 13 },
  phaseLabelActive: { color: '#fff', fontWeight: '600' },
});

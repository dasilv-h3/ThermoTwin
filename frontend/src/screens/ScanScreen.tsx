import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useARSession } from '../ar';

const STATUS_LABELS = {
  idle: 'Prêt',
  starting: 'Initialisation ARKit…',
  running: 'Session active',
  paused: 'En pause',
  stopped: 'Arrêté',
  error: 'Erreur',
} as const;

const TRACKING_LABELS = {
  'not-available': 'LiDAR indisponible',
  initializing: 'Calibration en cours…',
  limited: 'Tracking limité',
  normal: 'Tracking nominal',
  failed: 'Tracking échoué',
} as const;

export default function ScanScreen() {
  const { status, tracking, capability, error, start, stop } = useARSession();
  const canStart = capability.supported && status !== 'running' && status !== 'starting';

  useEffect(() => {
    return () => {
      stop().catch(() => {});
    };
  }, [stop]);

  return (
    <View style={styles.container}>
      <Ionicons name="scan" size={80} color="#00d4ff" />
      <Text style={styles.title}>Scanner une pièce</Text>

      <View style={styles.statusBlock}>
        <Text style={styles.statusLabel}>Session</Text>
        <Text style={styles.statusValue}>{STATUS_LABELS[status]}</Text>
        <Text style={styles.statusLabel}>Tracking</Text>
        <Text style={styles.statusValue}>{TRACKING_LABELS[tracking]}</Text>
      </View>

      {!capability.supported ? (
        <Text style={styles.warning}>
          Capteur LiDAR requis (iPhone 12 Pro ou supérieur).
          {capability.deviceModel ? ` Détecté : ${capability.deviceModel}.` : ''}
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error.message}</Text> : null}

      <Pressable
        accessibilityRole="button"
        style={[styles.button, !canStart && styles.buttonDisabled]}
        disabled={!canStart}
        onPress={() => {
          start().catch(() => {});
        }}
      >
        <Text style={styles.buttonText}>
          {status === 'starting' ? 'Démarrage…' : 'Démarrer le scan LiDAR'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusBlock: {
    backgroundColor: '#14213d',
    padding: 16,
    borderRadius: 10,
    width: '100%',
    gap: 4,
  },
  statusLabel: { color: '#9bbcf0', fontSize: 12 },
  statusValue: { color: '#ffffff', fontSize: 15, fontWeight: '600', marginBottom: 6 },
  warning: { color: '#f5c518', fontSize: 13, textAlign: 'center' },
  error: { color: '#ff6b6b', fontSize: 13, textAlign: 'center' },
  button: {
    backgroundColor: '#00d4ff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  buttonDisabled: { backgroundColor: '#2a3c5e' },
  buttonText: { color: '#0b1220', fontSize: 15, fontWeight: '700' },
});

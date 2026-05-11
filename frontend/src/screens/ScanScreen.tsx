import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useARSession } from '../ar';

const STATUS_LABELS = {
  idle: 'Prêt',
  starting: 'Initialisation…',
  running: 'Session active',
  paused: 'En pause',
  stopped: 'Arrêté',
  error: 'Erreur',
} as const;

const TRACKING_LABELS = {
  'not-available': 'Tracking indisponible',
  initializing: 'Calibration en cours…',
  limited: 'Tracking limité',
  normal: 'Tracking nominal',
  failed: 'Tracking échoué',
} as const;

export default function ScanScreen() {
  const { status, tracking, mode, capability, error, start, stop } = useARSession();
  const isStarting = status === 'starting';
  const isRunning = status === 'running';
  const modeLabel =
    mode === 'video-with-lidar'
      ? 'Vidéo + LiDAR'
      : mode === 'video'
        ? 'Vidéo'
        : capability.supported
          ? 'Vidéo + LiDAR (prêt)'
          : 'Vidéo';

  return (
    <View style={styles.container}>
      <Ionicons name="scan" size={80} color="#00d4ff" />
      <Text style={styles.title}>Scanner une pièce</Text>

      <View style={styles.statusBlock}>
        <Text style={styles.statusLabel}>Mode capture</Text>
        <Text style={styles.statusValue}>{modeLabel}</Text>
        <Text style={styles.statusLabel}>Session</Text>
        <Text style={styles.statusValue}>{STATUS_LABELS[status]}</Text>
        <Text style={styles.statusLabel}>Tracking</Text>
        <Text style={styles.statusValue}>{TRACKING_LABELS[tracking]}</Text>
      </View>

      {!capability.supported ? (
        <Text style={styles.hint}>
          Capteur LiDAR non détecté : scan vidéo uniquement (précision réduite).
        </Text>
      ) : (
        <Text style={styles.hint}>
          LiDAR disponible : le scan vidéo sera enrichi par la profondeur.
        </Text>
      )}

      {error ? <Text style={styles.error}>{error.message}</Text> : null}

      <Pressable
        accessibilityRole="button"
        style={[styles.button, isStarting && styles.buttonDisabled]}
        disabled={isStarting}
        onPress={() => {
          if (isRunning) {
            stop().catch(() => {});
          } else {
            start().catch(() => {});
          }
        }}
      >
        <Text style={styles.buttonText}>
          {isStarting ? 'Démarrage…' : isRunning ? 'Arrêter le scan' : 'Démarrer le scan'}
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
  hint: { color: '#9bbcf0', fontSize: 13, textAlign: 'center' },
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

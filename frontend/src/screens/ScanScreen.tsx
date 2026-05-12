import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useARSession } from '../ar';
import {
  ScanSessionFinalize,
  finalizeScanSession,
  startScanSession,
} from '../services/scanService';

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

const FINALIZE_REASON_LABELS = {
  ok: 'Crédit consommé',
  'no-frames': 'Aucune donnée captée — pas de crédit débité',
  'already-finalized': 'Scan déjà finalisé',
  'quota-exceeded': 'Quota épuisé',
} as const;

// Compteur synthétique en attendant le branchement réel des frames LiDAR
// (PointCloudBuffer / ARCore depth). 1 tick = 1 "frame" virtuelle, déclenché
// chaque 100 ms de session. Remplacer par PointCloudBuffer.getStats().frameCount
// quand la capture native sera branchée.
const SYNTHETIC_FRAME_INTERVAL_MS = 100;

export default function ScanScreen() {
  const { status, tracking, mode, capability, error, start, stop } = useARSession();
  const isStarting = status === 'starting';
  const isRunning = status === 'running';

  const [scanId, setScanId] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [finalizing, setFinalizing] = useState(false);
  const [lastResult, setLastResult] = useState<ScanSessionFinalize | null>(null);
  const frameTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      frameTimer.current = setInterval(() => {
        setFrameCount((n) => n + 1);
      }, SYNTHETIC_FRAME_INTERVAL_MS);
    }
    return () => {
      if (frameTimer.current) {
        clearInterval(frameTimer.current);
        frameTimer.current = null;
      }
    };
  }, [isRunning]);

  const modeLabel =
    mode === 'video-with-lidar'
      ? 'Vidéo + LiDAR'
      : mode === 'video'
        ? 'Vidéo'
        : capability.supported
          ? 'Vidéo + LiDAR (prêt)'
          : 'Vidéo';

  const handleStart = async () => {
    setLastResult(null);
    setFrameCount(0);
    try {
      const captureMode = mode === 'video-with-lidar' ? 'video-with-lidar' : 'video';
      const session = await startScanSession(captureMode);
      setScanId(session.scan_id);
      await start();
    } catch {
      setScanId(null);
    }
  };

  const handleStop = async () => {
    setFinalizing(true);
    try {
      await stop();
      if (scanId) {
        const result = await finalizeScanSession(scanId, frameCount);
        setLastResult(result);
      }
    } catch {
      // La finalisation peut échouer offline ; l'utilisateur retentera.
    } finally {
      setFinalizing(false);
      setScanId(null);
    }
  };

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
        {isRunning ? (
          <>
            <Text style={styles.statusLabel}>Frames captées</Text>
            <Text style={styles.statusValue}>{frameCount}</Text>
          </>
        ) : null}
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

      {lastResult ? (
        <View style={styles.resultBlock}>
          <Text
            style={[
              styles.resultText,
              lastResult.credit_consumed ? styles.resultOk : styles.resultNeutral,
            ]}
          >
            {FINALIZE_REASON_LABELS[lastResult.reason]}
          </Text>
          <Text style={styles.resultBalance}>
            Solde : {lastResult.scans_used} / {lastResult.scans_limit}
          </Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        style={[styles.button, (isStarting || finalizing) && styles.buttonDisabled]}
        disabled={isStarting || finalizing}
        onPress={() => {
          if (isRunning) {
            void handleStop();
          } else {
            void handleStart();
          }
        }}
      >
        {finalizing ? (
          <ActivityIndicator color="#0b1220" />
        ) : (
          <Text style={styles.buttonText}>
            {isStarting ? 'Démarrage…' : isRunning ? 'Arrêter le scan' : 'Démarrer le scan'}
          </Text>
        )}
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
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
  resultBlock: {
    backgroundColor: '#0e2e22',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    gap: 4,
  },
  resultText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  resultOk: { color: '#7ee29a' },
  resultNeutral: { color: '#9bbcf0' },
  resultBalance: { color: '#ffffff', fontSize: 12, textAlign: 'center' },
  button: {
    backgroundColor: '#00d4ff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#2a3c5e' },
  buttonText: { color: '#0b1220', fontSize: 15, fontWeight: '700' },
});

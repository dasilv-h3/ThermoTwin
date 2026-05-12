import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DPEChart } from '../components/dpe';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ScanDetail, fetchScanDetail } from '../services/scanService';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanDetail'>;

const SEVERITY_LABELS = {
  low: 'Faible',
  medium: 'Modéré',
  high: 'Élevé',
} as const;

const SEVERITY_COLORS = {
  low: '#7ee29a',
  medium: '#ffd400',
  high: '#ff6b6b',
} as const;

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ScanDetailScreen({ route }: Props) {
  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScanDetail(route.params.id)
      .then(setScan)
      .catch((e: Error) => setError(e.message));
  }, [route.params.id]);

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!scan) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#00d4ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Text style={styles.title}>{scan.location_label ?? 'Scan sans titre'}</Text>
      <Text style={styles.subtitle}>Démarré le {formatDate(scan.started_at)}</Text>
      <Text style={styles.subtitle}>Terminé le {formatDate(scan.finalized_at)}</Text>

      {scan.dpe_consumption !== null && scan.dpe_emissions !== null ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance énergétique</Text>
          <DPEChart consumption={scan.dpe_consumption} emissions={scan.dpe_emissions} />
        </View>
      ) : (
        <Text style={styles.placeholder}>DPE non encore calculé pour ce scan.</Text>
      )}

      {scan.thermal_stats ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques thermiques</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Min</Text>
              <Text style={styles.statValue}>{scan.thermal_stats.min_celsius.toFixed(1)} °C</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Moy</Text>
              <Text style={styles.statValue}>{scan.thermal_stats.mean_celsius.toFixed(1)} °C</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Max</Text>
              <Text style={styles.statValue}>{scan.thermal_stats.max_celsius.toFixed(1)} °C</Text>
            </View>
          </View>
        </View>
      ) : null}

      {scan.heat_zones.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zones de déperdition ({scan.heat_zones.length})</Text>
          {scan.heat_zones.map((z, i) => (
            <View key={i} style={styles.zoneRow}>
              <View style={[styles.zoneDot, { backgroundColor: SEVERITY_COLORS[z.severity] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.zoneArea}>{z.area}</Text>
                {z.description ? <Text style={styles.zoneDesc}>{z.description}</Text> : null}
              </View>
              <Text style={styles.zoneSeverity}>{SEVERITY_LABELS[z.severity]}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {scan.nearby_artisans.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artisans à proximité</Text>
          {scan.nearby_artisans.map((a) => (
            <View key={a.id} style={styles.artisanRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.artisanName}>{a.company_name}</Text>
                <Text style={styles.artisanMeta}>
                  {a.distance_km.toFixed(1)} km · {a.specialties.join(', ')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails techniques</Text>
        <Text style={styles.meta}>
          Mode capture : {scan.capture_mode === 'video-with-lidar' ? 'Vidéo + LiDAR' : 'Vidéo'}
        </Text>
        <Text style={styles.meta}>Frames captées : {scan.frame_count}</Text>
        <Text style={styles.meta}>Crédit consommé : {scan.credit_consumed ? 'oui' : 'non'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, gap: 16 },
  title: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#9bbcf0', fontSize: 12 },
  section: { backgroundColor: '#14213d', borderRadius: 10, padding: 14, gap: 8 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  placeholder: { color: '#5f6b7f', fontStyle: 'italic', textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statLabel: { color: '#9bbcf0', fontSize: 12 },
  statValue: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginTop: 4 },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  zoneDot: { width: 10, height: 10, borderRadius: 5 },
  zoneArea: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  zoneDesc: { color: '#9bbcf0', fontSize: 12, marginTop: 2 },
  zoneSeverity: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  artisanRow: { paddingVertical: 8 },
  artisanName: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  artisanMeta: { color: '#9bbcf0', fontSize: 12, marginTop: 2 },
  meta: { color: '#9bbcf0', fontSize: 13 },
  error: { color: '#ff6b6b', textAlign: 'center', padding: 24 },
});

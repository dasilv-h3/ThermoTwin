import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RootStackParamList } from '../navigation/RootNavigator';
import { ScanSummary, fetchScanHistory } from '../services/scanService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DPE_COLORS: Record<string, string> = {
  A: '#2c9a3a',
  B: '#68b738',
  C: '#c8d32f',
  D: '#f4d000',
  E: '#f08a1d',
  F: '#e4571b',
  G: '#d0201c',
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<ScanSummary[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { items } = await fetchScanHistory();
      setItems(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (items === null && error === null) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#00d4ff" />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      style={styles.container}
      data={items ?? []}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
      }
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Historique des scans</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          Aucun scan pour le moment. Lance un scan depuis l&apos;onglet Scanner.
        </Text>
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          style={styles.card}
          onPress={() => navigation.navigate('ScanDetail', { id: item.id })}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.location_label ?? 'Scan sans titre'}</Text>
            <Text style={styles.cardDate}>{formatDate(item.started_at)}</Text>
            {item.duration_ms ? (
              <Text style={styles.cardMeta}>{Math.round(item.duration_ms / 1000)}s</Text>
            ) : null}
          </View>
          {item.dpe_class ? (
            <View
              style={[
                styles.dpeBadge,
                { backgroundColor: DPE_COLORS[item.dpe_class] ?? '#5f6b7f' },
              ]}
            >
              <Text style={styles.dpeBadgeLetter}>{item.dpe_class}</Text>
            </View>
          ) : (
            <Text style={styles.cardMeta}>—</Text>
          )}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1a1a2e', flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 12 },
  title: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  empty: { color: '#9bbcf0', textAlign: 'center', marginTop: 32 },
  error: { color: '#ff6b6b', marginBottom: 12 },
  card: {
    backgroundColor: '#14213d',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  cardDate: { color: '#9bbcf0', fontSize: 12, marginTop: 4 },
  cardMeta: { color: '#5f6b7f', fontSize: 12, marginTop: 2 },
  dpeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpeBadgeLetter: { color: '#0b1220', fontSize: 20, fontWeight: '800' },
});

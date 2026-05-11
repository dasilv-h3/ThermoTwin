import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { RootStackParamList } from '../navigation/RootNavigator';
import { Artisan, fetchArtisans, Specialty } from '../services/artisansService';

type Props = NativeStackScreenProps<RootStackParamList, 'ArtisansList'>;

interface FilterChip {
  label: string;
  specialty: Specialty | null;
}

const FILTERS: FilterChip[] = [
  { label: 'Tous', specialty: null },
  { label: 'Isolation', specialty: 'wall_insulation' },
  { label: 'Fenêtres', specialty: 'window_replacement' },
  { label: 'Toiture', specialty: 'roof_insulation' },
  { label: 'Chauffage', specialty: 'heating' },
];

function initials(name: string): string {
  const cleaned = name.replace(/[^A-Za-zÀ-ÿ ]/g, '').trim();
  const words = cleaned.split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? '').join('');
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const stars: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    let icon: 'star' | 'star-half' | 'star-outline' = 'star-outline';
    if (i < full) icon = 'star';
    else if (i === full && hasHalf) icon = 'star-half';
    stars.push(<Ionicons key={i} name={icon} size={14} color="#fbbf24" />);
  }
  return <View style={styles.starsRow}>{stars}</View>;
}

export default function ArtisansListScreen({ navigation }: Props) {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<Specialty | null>(null);
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchArtisans({
      specialty: activeFilter ?? undefined,
      search: search || undefined,
      postal_code: postalCode || undefined,
      limit: 50,
    })
      .then((res) => {
        if (!cancelled) setArtisans(res.items);
      })
      .catch(() => {
        if (!cancelled) setArtisans([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeFilter, search, postalCode]);

  function renderItem({ item }: { item: Artisan }) {
    const cert = item.certifications[0];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ArtisanDetail', { id: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(item.company_name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.companyName} numberOfLines={2}>
              {item.company_name}
            </Text>
            <View style={styles.ratingRow}>
              <Stars rating={item.rating} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              <Text style={styles.reviewsText}>({item.reviews_count} avis)</Text>
            </View>
          </View>
        </View>

        {item.specialties[0] && (
          <View style={styles.specialtyChip}>
            <Text style={styles.specialtyText}>{item.specialties[0].replace(/_/g, ' ')}</Text>
          </View>
        )}

        {item.about && (
          <Text style={styles.aboutText} numberOfLines={2}>
            {item.about}
          </Text>
        )}

        {cert && (
          <View style={styles.certRow}>
            <Ionicons name="shield-checkmark" size={16} color="#10b981" />
            <Text style={styles.certText} numberOfLines={1}>
              {cert.name}
            </Text>
            <Text style={styles.metaText}>
              {item.experience_years || 0} ans · {item.projects_count || 0} projets
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Artisans RGE</Text>
        <View style={styles.iconButton}>
          <Ionicons name="filter" size={20} color="#ffffff" />
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.locationChip}>
          <Ionicons name="location" size={16} color="#00d4ff" />
          <TextInput
            style={styles.locationInput}
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="number-pad"
            maxLength={5}
            placeholder="Tous"
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.searchInputBox}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Filtrer par nom..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.dataSourceRow}>
        <Ionicons name="shield-checkmark" size={14} color="#10b981" />
        <Text style={styles.dataSourceText}>API ADEME - Données officielles</Text>
      </View>

      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((item) => {
            const active = activeFilter === item.specialty;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(item.specialty)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLeft}>Tri : Distance</Text>
        <Text style={styles.summaryRight}>{artisans.length} artisans trouvés</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#00d4ff" size="large" />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={artisans}
          keyExtractor={(a) => a.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color="#666" />
              <Text style={styles.emptyTitle}>Aucun artisan trouvé</Text>
              <Text style={styles.emptyHint}>
                {postalCode
                  ? `Aucun résultat pour le code postal ${postalCode}. Essayez un autre département.`
                  : 'Modifiez vos filtres pour voir plus de résultats.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },

  searchRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginTop: 4 },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 6,
  },
  locationInput: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', minWidth: 36 },
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 15 },

  dataSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  dataSourceText: { color: '#10b981', fontSize: 13 },

  filtersWrapper: { height: 50 },
  filtersRow: { paddingHorizontal: 20, gap: 8, paddingVertical: 6 },
  filterChip: {
    borderWidth: 1,
    borderColor: '#00d4ff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
  },
  filterChipActive: { backgroundColor: '#00d4ff' },
  filterText: { color: '#00d4ff', fontWeight: '600', fontSize: 14 },
  filterTextActive: { color: '#ffffff' },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  summaryLeft: { color: '#999999', fontSize: 13 },
  summaryRight: { color: '#999999', fontSize: 13 },

  listContent: { paddingHorizontal: 20, paddingBottom: 30, gap: 12 },

  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00d4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 14 },
  companyName: { color: '#ffffff', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  starsRow: { flexDirection: 'row', gap: 1 },
  ratingText: { color: '#fbbf24', fontWeight: 'bold', fontSize: 14 },
  reviewsText: { color: '#999', fontSize: 12 },

  specialtyChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  specialtyText: { color: '#10b981', fontSize: 12, fontWeight: '600' },

  aboutText: { color: '#999999', fontSize: 13, marginBottom: 10, lineHeight: 18 },

  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  certText: { color: '#10b981', fontSize: 12, flex: 1 },
  metaText: { color: '#999', fontSize: 12 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  emptyHint: { color: '#999', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

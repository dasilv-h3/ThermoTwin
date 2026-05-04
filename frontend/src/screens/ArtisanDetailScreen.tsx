import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { RootStackParamList } from '../navigation/RootNavigator';
import { Artisan, fetchArtisan } from '../services/artisansService';

type Props = NativeStackScreenProps<RootStackParamList, 'ArtisanDetail'>;

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
    stars.push(<Ionicons key={i} name={icon} size={18} color="#fbbf24" />);
  }
  return <View style={styles.starsRow}>{stars}</View>;
}

export default function ArtisanDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtisan(id)
      .then(setArtisan)
      .catch(() => setArtisan(null))
      .finally(() => setLoading(false));
  }, [id]);

  function call() {
    if (!artisan?.phone) return;
    Linking.openURL(`tel:${artisan.phone}`);
  }

  function email() {
    if (!artisan?.email) return;
    Linking.openURL(`mailto:${artisan.email}`);
  }

  function quote() {
    Alert.alert('Demande de devis', 'Cette fonctionnalité sera bientôt disponible.');
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  if (!artisan) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Artisan introuvable</Text>
      </View>
    );
  }

  const cert = artisan.certifications[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail Artisan</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.heroBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(artisan.company_name)}</Text>
        </View>
        <Text style={styles.companyName}>{artisan.company_name}</Text>
        <Text style={styles.companySub}>{artisan.company_name}</Text>

        <View style={styles.ratingRow}>
          <Stars rating={artisan.rating} />
          <Text style={styles.ratingText}>{artisan.rating.toFixed(1)}</Text>
          <Text style={styles.reviewsText}>({artisan.reviews_count} avis)</Text>
        </View>

        {cert && (
          <View style={styles.certBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#10b981" />
            <Text style={styles.certBadgeText} numberOfLines={1}>
              {cert.name}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        <ActionButton icon="call" label="Appeler" onPress={call} disabled={!artisan.phone} />
        <ActionButton icon="mail" label="Email" onPress={email} disabled={!artisan.email} />
        <ActionButton icon="document-text" label="Devis" onPress={quote} primary />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos</Text>
        <Text style={styles.sectionText}>{artisan.about ?? 'Aucune description disponible.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spécialités</Text>
        <View style={styles.chipsRow}>
          {artisan.specialties.length === 0 && (
            <Text style={styles.sectionText}>Aucune spécialité renseignée.</Text>
          )}
          {artisan.specialties.map((s) => (
            <View key={s} style={styles.specChip}>
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              <Text style={styles.specChipText}>{s.replace(/_/g, ' ')}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expérience</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="time-outline"
            iconColor="#00d4ff"
            value={artisan.experience_years}
            label="années"
          />
          <StatCard
            icon="construct-outline"
            iconColor="#00d4ff"
            value={artisan.projects_count}
            label="projets"
          />
          <StatCard
            icon="star"
            iconColor="#fbbf24"
            value={artisan.rating.toFixed(1)}
            label="note"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.bigCta} onPress={quote}>
        <Text style={styles.bigCtaText}>Demander un devis gratuit</Text>
        <Ionicons name="arrow-forward" size={20} color="#ffffff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

interface ActionButtonProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}

function ActionButton({ icon, label, onPress, primary, disabled }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        primary && styles.actionButtonPrimary,
        disabled && styles.actionDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={22} color={primary ? '#ffffff' : '#00d4ff'} />
      <Text style={[styles.actionLabel, primary && styles.actionLabelPrimary]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface StatCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  value: string | number;
  label: string;
}

function StatCard({ icon, iconColor, value, label }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color={iconColor} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { paddingBottom: 40 },
  center: { alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
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

  heroBlock: { alignItems: 'center', paddingTop: 16, paddingBottom: 24, paddingHorizontal: 20 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00d4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 28 },
  companyName: { color: '#ffffff', fontWeight: 'bold', fontSize: 22, textAlign: 'center' },
  companySub: { color: '#999', fontSize: 14, marginTop: 2, textAlign: 'center' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  starsRow: { flexDirection: 'row', gap: 2 },
  ratingText: { color: '#fbbf24', fontWeight: 'bold', fontSize: 18 },
  reviewsText: { color: '#999', fontSize: 13 },

  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 14,
    maxWidth: '85%',
  },
  certBadgeText: { color: '#10b981', fontSize: 13 },

  actionsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  actionButton: {
    flex: 1,
    backgroundColor: '#16213e',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonPrimary: { backgroundColor: '#00d4ff' },
  actionDisabled: { opacity: 0.4 },
  actionLabel: { color: '#00d4ff', fontWeight: '600', fontSize: 14 },
  actionLabelPrimary: { color: '#ffffff' },

  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { color: '#ffffff', fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  sectionText: { color: '#cccccc', fontSize: 14, lineHeight: 20 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  specChipText: { color: '#10b981', fontSize: 13, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: { color: '#ffffff', fontWeight: 'bold', fontSize: 22 },
  statLabel: { color: '#999', fontSize: 12 },

  bigCta: {
    marginHorizontal: 20,
    backgroundColor: '#00d4ff',
    paddingVertical: 18,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bigCtaText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },

  errorText: { color: '#ff6b6b', fontSize: 16 },
});

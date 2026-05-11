import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RootStackParamList } from '../navigation/RootNavigator';
import { TabParamList } from '../navigation/TabNavigator';
import { useAppSelector } from '../store/hooks';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const TIER_LABEL = {
  free: 'Gratuit',
  premium: 'Premium',
  lifetime: 'Lifetime',
} as const;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  const sub = user.subscription;
  const progress = sub.scans_limit > 0 ? sub.scans_used / sub.scans_limit : 0;

  function comingSoon() {
    Alert.alert('Bientôt disponible', 'Cette fonctionnalité sera disponible prochainement.');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{user.first_name || 'Utilisateur'}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.planCard}>
        <View style={styles.planHeaderRow}>
          <View>
            <Text style={styles.planLabel}>Votre plan</Text>
            <Text style={styles.planTier}>{TIER_LABEL[sub.tier]}</Text>
          </View>
          {sub.tier === 'free' && (
            <TouchableOpacity style={styles.upgradeButton} onPress={comingSoon}>
              <Ionicons name="arrow-up" size={16} color="#ffffff" />
              <Text style={styles.upgradeText}>Améliorer</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.scansRow}>
          <Text style={styles.scansLabel}>Scans utilisés</Text>
          <Text style={styles.scansCount}>
            {sub.scans_used} / {sub.scans_limit}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, progress * 100)}%` }]} />
        </View>
      </View>

      <View style={styles.tilesGrid}>
        <Tile
          variant="primary"
          icon="scan-outline"
          title="Nouveau Scan"
          subtitle="Analyser une pièce"
          onPress={() => navigation.navigate('Scan')}
        />
        <Tile
          icon="time-outline"
          iconBg="#f59e0b"
          title="Historique"
          subtitle="Mes scans"
          onPress={comingSoon}
        />
        <Tile
          icon="construct-outline"
          iconBg="#10b981"
          title="Artisans RGE"
          subtitle="Trouver un pro"
          onPress={() => navigation.navigate('ArtisansList')}
        />
        <Tile
          icon="settings-outline"
          iconBg="#a855f7"
          title="Paramètres"
          subtitle="Mon compte"
          onPress={() => navigation.navigate('Profile')}
        />
      </View>

      <Text style={styles.sectionTitle}>Que peut faire ThermoTwin ?</Text>

      <FeatureRow
        icon="thermometer"
        iconColor="#ef4444"
        title="Analyse Thermique IA"
        description="Détection automatique des pertes de chaleur avec recommandations personnalisées"
      />
      <FeatureRow
        icon="cash-outline"
        iconColor="#00d4ff"
        title="Économies d'énergie"
        description="Estimations précises des économies potentielles sur vos factures de chauffage"
      />
      <FeatureRow
        icon="bulb-outline"
        iconColor="#fbbf24"
        title="Recommandations"
        description="Suggestions de travaux priorisés par retour sur investissement"
      />
    </ScrollView>
  );
}

interface TileProps {
  variant?: 'primary' | 'secondary';
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg?: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function Tile({ variant = 'secondary', icon, iconBg, title, subtitle, onPress }: TileProps) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[styles.tile, isPrimary && styles.tilePrimary]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.tileIconCircle,
          isPrimary
            ? { backgroundColor: 'rgba(255,255,255,0.2)' }
            : { backgroundColor: iconBg ?? '#16213e' },
        ]}
      >
        <Ionicons name={icon} size={28} color="#ffffff" />
      </View>
      <Text style={[styles.tileTitle, isPrimary && styles.tilePrimaryText]}>{title}</Text>
      <Text style={[styles.tileSubtitle, isPrimary && styles.tilePrimaryText]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

interface FeatureRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  title: string;
  description: string;
}

function FeatureRow({ icon, iconColor, title, description }: FeatureRowProps) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name={icon} size={28} color={iconColor} style={styles.featureIcon} />
      <View style={styles.featureBody}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: '#cccccc',
    fontSize: 16,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2f4a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  planCard: {
    borderWidth: 1,
    borderColor: '#4ecdc4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planLabel: {
    color: '#cccccc',
    fontSize: 14,
  },
  planTier: {
    color: '#4ecdc4',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 2,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2f4a',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  upgradeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scansRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scansLabel: {
    color: '#cccccc',
    fontSize: 14,
  },
  scansCount: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#2a2f4a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ecdc4',
  },

  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  tile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  tilePrimary: {
    backgroundColor: '#00d4ff',
  },
  tilePrimaryText: {
    color: '#ffffff',
  },
  tileIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tileTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tileSubtitle: {
    color: '#999999',
    fontSize: 13,
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    gap: 14,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginTop: 2,
  },
  featureBody: {
    flex: 1,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#999999',
    fontSize: 14,
    lineHeight: 20,
  },
});

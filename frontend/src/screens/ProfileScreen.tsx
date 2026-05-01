import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { RootStackParamList } from '../navigation/RootNavigator';
import { SubscriptionTier } from '../services/authService';
import { logoutThunk } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TIER_LABEL: Record<SubscriptionTier, string> = {
  free: 'Gratuit',
  premium: 'Premium',
  lifetime: 'Lifetime',
};

const TIER_PLAN: Record<
  SubscriptionTier,
  { name: string; price: string; features: string[] }
> = {
  free: {
    name: 'Plan Gratuit',
    price: '0€/mois',
    features: ['5 scans thermiques par mois', 'Analyse IA basique', 'Historique des scans'],
  },
  premium: {
    name: 'Plan Premium',
    price: '9,99€/mois',
    features: ['50 scans thermiques par mois', 'Analyse IA avancée', 'Support prioritaire'],
  },
  lifetime: {
    name: 'Plan Lifetime',
    price: '49€ une fois',
    features: ['Scans illimités', 'Analyse IA avancée', 'Support prioritaire'],
  },
};

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  const tier = user.subscription.tier;
  const plan = TIER_PLAN[tier];
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  const scansAvailable = Math.max(0, user.subscription.scans_limit - user.subscription.scans_used);

  function handleLogout() {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => dispatch(logoutThunk()),
      },
    ]);
  }

  function comingSoon() {
    Alert.alert('Bientôt disponible', 'Cette fonctionnalité sera disponible prochainement.');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={64} color="#ffffff" />
          </View>
          <Text style={styles.name}>{fullName || 'Utilisateur'}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeText}>{TIER_LABEL[tier]}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.subscription.scans_used}</Text>
            <Text style={styles.statLabel}>Scans effectués</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{scansAvailable}</Text>
            <Text style={styles.statLabel}>Scans disponibles</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Détails du plan</Text>

        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
            </View>
            <Ionicons name="gift-outline" size={32} color="#4ecdc4" />
          </View>

          <View style={styles.featureList}>
            {plan.features.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#4ecdc4" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {tier === 'free' && (
            <TouchableOpacity style={styles.upgradeButton} onPress={comingSoon}>
              <Text style={styles.upgradeButtonText}>Passer à Premium</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        <MenuItem
          icon="create-outline"
          label="Modifier mon profil"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <MenuItem
          icon="lock-closed-outline"
          label="Changer le mot de passe"
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <MenuItem icon="notifications-outline" label="Notifications" onPress={comingSoon} />
        <MenuItem icon="help-circle-outline" label="Aide & Support" onPress={comingSoon} />
        <MenuItem icon="document-text-outline" label="Conditions d'utilisation" onPress={comingSoon} />
        <MenuItem icon="shield-checkmark-outline" label="Confidentialité" onPress={comingSoon} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ff6b6b" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

interface MenuItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={22} color="#00d4ff" />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#4ecdc4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  email: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  tierBadge: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  tierBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#16213e',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  statLabel: {
    fontSize: 13,
    color: '#999999',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  planCard: {
    borderWidth: 1,
    borderColor: '#4ecdc4',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  planPrice: {
    fontSize: 14,
    color: '#999999',
    marginTop: 2,
  },
  featureList: {
    gap: 12,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#00d4ff',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 14,
    marginBottom: 10,
  },
  menuLabel: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    gap: 8,
  },
  logoutText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 16,
  },
});

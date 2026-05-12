import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  CreditPack,
  CreditPackId,
  fetchCreditPacks,
  purchaseCreditPack,
} from '../services/creditService';
import { hydrateThunk } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'BuyCredits'>;

export default function BuyCreditsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const subscription = useAppSelector((s) => s.auth.user?.subscription);
  const [packs, setPacks] = useState<CreditPack[] | null>(null);
  const [purchasingId, setPurchasingId] = useState<CreditPackId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditPacks()
      .then(({ items }) => setPacks(items))
      .catch((e: Error) => setError(e.message));
  }, []);

  const handlePurchase = async (pack: CreditPack) => {
    setPurchasingId(pack.id);
    setError(null);
    try {
      const result = await purchaseCreditPack(pack.id);
      await dispatch(hydrateThunk());
      Alert.alert(
        'Achat confirmé',
        `+${result.credits_added} scans ajoutés. Nouveau solde : ${result.scans_used} / ${result.scans_limit}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec du paiement');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Acheter des scans</Text>
      {subscription ? (
        <Text style={styles.balance}>
          Solde actuel : {subscription.scans_used} / {subscription.scans_limit}
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {packs === null ? (
        <ActivityIndicator color="#00d4ff" style={{ marginTop: 24 }} />
      ) : (
        packs.map((pack) => {
          const isLoading = purchasingId === pack.id;
          const perUnit = (pack.price_eur / pack.credits).toFixed(2);
          return (
            <View key={pack.id} style={styles.packCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.packLabel}>{pack.label}</Text>
                <Text style={styles.packPrice}>{pack.price_eur.toFixed(2)} €</Text>
                <Text style={styles.packPerUnit}>Soit {perUnit} € / scan</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                style={[styles.buyButton, isLoading && styles.buyButtonDisabled]}
                disabled={isLoading || purchasingId !== null}
                onPress={() => void handlePurchase(pack)}
              >
                {isLoading ? (
                  <ActivityIndicator color="#0b1220" />
                ) : (
                  <Text style={styles.buyButtonText}>Acheter</Text>
                )}
              </Pressable>
            </View>
          );
        })
      )}

      <Text style={styles.disclaimer}>
        POC : paiement mock côté serveur, aucun débit réel. Stripe sera branché en production.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#1a1a2e', flexGrow: 1, gap: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  balance: { color: '#9bbcf0', fontSize: 14, marginBottom: 8 },
  error: { color: '#ff6b6b', fontSize: 13 },
  packCard: {
    backgroundColor: '#14213d',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  packLabel: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  packPrice: { color: '#00d4ff', fontSize: 18, fontWeight: '700', marginTop: 4 },
  packPerUnit: { color: '#9bbcf0', fontSize: 12, marginTop: 4 },
  buyButton: {
    backgroundColor: '#00d4ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    minWidth: 90,
    alignItems: 'center',
  },
  buyButtonDisabled: { backgroundColor: '#2a3c5e' },
  buyButtonText: { color: '#0b1220', fontWeight: '700' },
  disclaimer: { color: '#5f6b7f', fontSize: 11, textAlign: 'center', marginTop: 16 },
});

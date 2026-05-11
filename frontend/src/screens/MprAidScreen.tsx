import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { RootStackParamList } from '../navigation/RootNavigator';
import {
  AidAmountResponse,
  BRACKET_COLOR,
  BRACKET_LABEL,
  fetchAidAmount,
  GeoZone,
  reasonMessage,
  WORK_TYPES,
  WorkType,
  WorkTypeMeta,
} from '../services/mprService';

type Props = NativeStackScreenProps<RootStackParamList, 'MprAid'>;

const CATEGORIES: { key: WorkTypeMeta['category']; label: string }[] = [
  { key: 'chauffage', label: 'Chauffage' },
  { key: 'eau-chaude', label: 'Eau chaude' },
  { key: 'bois', label: 'Bois' },
  { key: 'isolation', label: 'Isolation' },
  { key: 'ventilation', label: 'Ventilation' },
  { key: 'autre', label: 'Autre' },
];

function formatEuros(n: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' €';
}

export default function MprAidScreen({ navigation }: Props) {
  const [revenuFiscal, setRevenuFiscal] = useState('');
  const [householdSize, setHouseholdSize] = useState('1');
  const [zone, setZone] = useState<GeoZone>('hors_idf');
  const [category, setCategory] = useState<WorkTypeMeta['category']>('chauffage');
  const [workType, setWorkType] = useState<WorkType | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [grossCost, setGrossCost] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AidAmountResponse | null>(null);

  const filteredWorks = useMemo(
    () => WORK_TYPES.filter((w) => w.category === category),
    [category],
  );

  const selectedMeta = useMemo(
    () => WORK_TYPES.find((w) => w.key === workType) ?? null,
    [workType],
  );

  const quantitySpec = selectedMeta?.quantity ?? null;

  async function handleCompute() {
    setError(null);
    setResult(null);

    const rfr = parseInt(revenuFiscal, 10);
    if (!Number.isFinite(rfr) || rfr < 0) {
      setError('Renseigne un revenu fiscal valide.');
      return;
    }
    if (!workType) {
      setError('Choisis un type de travaux.');
      return;
    }
    const size = parseInt(householdSize, 10) || 1;
    const qty = parseFloat(quantity.replace(',', '.')) || 1;

    setLoading(true);
    try {
      const res = await fetchAidAmount({
        revenu_fiscal: rfr,
        household_size: size,
        zone,
        work_type: workType,
        year: 2026,
        quantity: qty,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau.');
    } finally {
      setLoading(false);
    }
  }

  const grossCostNum = parseFloat(grossCost.replace(',', '.'));
  const remainingCost =
    result && result.is_eligible && Number.isFinite(grossCostNum)
      ? Math.max(0, grossCostNum - result.amount)
      : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MaPrimeRénov’</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dataSourceRow}>
          <Ionicons name="shield-checkmark" size={14} color="#10b981" />
          <Text style={styles.dataSourceText}>Barème officiel ANAH 2026</Text>
        </View>

        <Text style={styles.label}>Revenu fiscal de référence</Text>
        <TextInput
          style={styles.input}
          value={revenuFiscal}
          onChangeText={setRevenuFiscal}
          placeholder="ex : 25 000"
          placeholderTextColor="#666"
          keyboardType="number-pad"
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Personnes au foyer</Text>
            <TextInput
              style={styles.input}
              value={householdSize}
              onChangeText={setHouseholdSize}
              placeholder="1"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Zone</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleChip, zone === 'hors_idf' && styles.toggleChipActive]}
                onPress={() => setZone('hors_idf')}
              >
                <Text style={[styles.toggleText, zone === 'hors_idf' && styles.toggleTextActive]}>
                  Hors IDF
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleChip, zone === 'idf' && styles.toggleChipActive]}
                onPress={() => setZone('idf')}
              >
                <Text style={[styles.toggleText, zone === 'idf' && styles.toggleTextActive]}>
                  IDF
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.label}>Catégorie de travaux</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => {
                  setCategory(c.key);
                  setWorkType(null);
                }}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.label}>Type de travaux</Text>
        <View style={styles.worksGrid}>
          {filteredWorks.map((w) => {
            const active = workType === w.key;
            return (
              <TouchableOpacity
                key={w.key}
                style={[styles.workChip, active && styles.workChipActive]}
                onPress={() => setWorkType(w.key)}
              >
                <Text style={[styles.workText, active && styles.workTextActive]}>{w.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {quantitySpec && (
          <>
            <Text style={styles.label}>
              {quantitySpec.label} ({quantitySpec.unit})
            </Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder={quantitySpec.placeholder}
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
            />
            <Text style={styles.helper}>{quantitySpec.helper}</Text>
          </>
        )}

        <Text style={styles.label}>Coût brut estimé du chantier (optionnel)</Text>
        <TextInput
          style={styles.input}
          value={grossCost}
          onChangeText={setGrossCost}
          placeholder="ex : 10 000"
          placeholderTextColor="#666"
          keyboardType="decimal-pad"
        />

        <TouchableOpacity
          style={[styles.cta, loading && { opacity: 0.6 }]}
          onPress={handleCompute}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="calculator" size={18} color="#ffffff" />
              <Text style={styles.ctaText}>Calculer mon aide</Text>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#ff6b6b" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {result && (
          <ResultCard result={result} grossCost={grossCostNum} remaining={remainingCost} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface ResultCardProps {
  result: AidAmountResponse;
  grossCost: number;
  remaining: number | null;
}

function ResultCard({ result, grossCost, remaining }: ResultCardProps) {
  const bracketColor = BRACKET_COLOR[result.bracket];
  const bracketLabel = BRACKET_LABEL[result.bracket];
  const message = reasonMessage(result.reason, result.bracket, result.year);

  return (
    <View style={styles.resultCard}>
      <View style={styles.bracketRow}>
        <View style={[styles.bracketDot, { backgroundColor: bracketColor }]} />
        <Text style={styles.bracketText}>Tranche : {bracketLabel}</Text>
      </View>

      <View style={styles.statusRow}>
        <Ionicons
          name={result.is_eligible ? 'checkmark-circle' : 'close-circle'}
          size={22}
          color={result.is_eligible ? '#10b981' : '#ff6b6b'}
        />
        <Text style={styles.statusText}>{message}</Text>
      </View>

      {result.is_eligible && (
        <View style={styles.breakdownBox}>
          {Number.isFinite(grossCost) && grossCost > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Coût brut du chantier</Text>
              <Text style={styles.breakdownValue}>{formatEuros(grossCost)}</Text>
            </View>
          )}
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Aide MaPrimeRénov’
              {result.unit !== 'forfait' && result.unit_amount != null
                ? ` (${formatEuros(result.unit_amount)} × ${result.quantity_applied})`
                : ''}
            </Text>
            <Text style={[styles.breakdownValue, { color: '#10b981' }]}>
              − {formatEuros(result.amount)}
            </Text>
          </View>
          {remaining != null && (
            <>
              <View style={styles.divider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.totalLabel}>Reste à charge</Text>
                <Text style={styles.totalValue}>{formatEuros(remaining)}</Text>
              </View>
            </>
          )}
        </View>
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

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  dataSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 12,
  },
  dataSourceText: { color: '#10b981', fontSize: 13 },

  label: { color: '#cbd5e1', fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  helper: { color: '#94a3b8', fontSize: 12, marginTop: 6, lineHeight: 16 },

  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    color: '#ffffff',
    fontSize: 15,
  },

  row: { flexDirection: 'row', gap: 12 },

  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleChip: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleChipActive: { borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.12)' },
  toggleText: { color: '#999', fontSize: 14 },
  toggleTextActive: { color: '#00d4ff', fontWeight: 'bold' },

  chipsRow: { gap: 8, paddingVertical: 6 },
  filterChip: {
    borderWidth: 1,
    borderColor: '#00d4ff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    height: 36,
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: '#00d4ff' },
  filterText: { color: '#00d4ff', fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#ffffff' },

  worksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  workChip: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  workChipActive: { borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.12)' },
  workText: { color: '#cbd5e1', fontSize: 13 },
  workTextActive: { color: '#00d4ff', fontWeight: 'bold' },

  cta: {
    marginTop: 24,
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  errorText: { color: '#ff6b6b', fontSize: 13, flex: 1 },

  resultCard: {
    marginTop: 20,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  bracketRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bracketDot: { width: 14, height: 14, borderRadius: 7 },
  bracketText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },

  statusRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  statusText: { color: '#cbd5e1', fontSize: 14, flex: 1, lineHeight: 20 },

  breakdownBox: {
    marginTop: 4,
    backgroundColor: 'rgba(0,212,255,0.06)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownLabel: { color: '#cbd5e1', fontSize: 13, flex: 1, paddingRight: 8 },
  breakdownValue: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  totalLabel: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  totalValue: { color: '#00d4ff', fontSize: 18, fontWeight: 'bold' },
});

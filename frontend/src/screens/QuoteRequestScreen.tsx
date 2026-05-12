import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type HousingType = 'house' | 'apartment' | 'other';

export type WorkTypeOption =
  | 'roof_insulation'
  | 'wall_insulation'
  | 'windows'
  | 'heating'
  | 'ventilation'
  | 'solar_panels';

export type QuoteRequestPayload = {
  fullName: string;
  email: string;
  phone: string;
  housingType: HousingType;
  surface: number;
  postalCode: string;
  workTypes: WorkTypeOption[];
  message: string;
};

type Props = {
  onSubmit?: (payload: QuoteRequestPayload) => void;
  submitting?: boolean;
};

const HOUSING_OPTIONS: { key: HousingType; label: string }[] = [
  { key: 'house', label: 'Maison' },
  { key: 'apartment', label: 'Appartement' },
  { key: 'other', label: 'Autre' },
];

const WORK_OPTIONS: { key: WorkTypeOption; label: string }[] = [
  { key: 'roof_insulation', label: 'Isolation toiture' },
  { key: 'wall_insulation', label: 'Isolation murs' },
  { key: 'windows', label: 'Fenêtres' },
  { key: 'heating', label: 'Chauffage / PAC' },
  { key: 'ventilation', label: 'VMC' },
  { key: 'solar_panels', label: 'Panneaux solaires' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\s().-]{8,}$/;
const POSTAL_RE = /^[0-9]{5}$/;

export default function QuoteRequestScreen({ onSubmit, submitting }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [housingType, setHousingType] = useState<HousingType>('house');
  const [surface, setSurface] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [workTypes, setWorkTypes] = useState<Set<WorkTypeOption>>(new Set());
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof QuoteRequestPayload, string>> = {};
    if (!fullName.trim()) e.fullName = 'Nom obligatoire';
    if (!EMAIL_RE.test(email)) e.email = 'Email invalide';
    if (!PHONE_RE.test(phone)) e.phone = 'Téléphone invalide';
    const surfaceNum = Number(surface);
    if (!surface || !Number.isFinite(surfaceNum) || surfaceNum <= 0) e.surface = 'Surface invalide';
    if (!POSTAL_RE.test(postalCode)) e.postalCode = 'Code postal invalide';
    if (workTypes.size === 0) e.workTypes = 'Sélectionnez au moins un poste';
    return e;
  }, [fullName, email, phone, surface, postalCode, workTypes]);

  const isValid = Object.keys(errors).length === 0;

  const toggleWork = (key: WorkTypeOption) => {
    setWorkTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const submit = () => {
    setTouched(true);
    if (!isValid) return;
    onSubmit?.({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      housingType,
      surface: Number(surface),
      postalCode: postalCode.trim(),
      workTypes: Array.from(workTypes),
      message: message.trim(),
    });
  };

  const err = (field: keyof QuoteRequestPayload) => (touched ? errors[field] : undefined);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Demande de devis</Text>
        <Text style={styles.subtitle}>
          Parlez-nous de votre logement et des travaux envisagés, nous revenons vers vous sous 48h.
        </Text>

        <Text style={styles.section}>Vos coordonnées</Text>

        <Field
          label="Nom complet"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          error={err('fullName')}
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={err('email')}
        />
        <Field
          label="Téléphone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={err('phone')}
        />

        <Text style={styles.section}>Votre logement</Text>

        <Text style={styles.label}>Type de logement</Text>
        <View style={styles.segmented}>
          {HOUSING_OPTIONS.map((opt) => {
            const active = housingType === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[styles.segment, active && styles.segmentActive]}
                onPress={() => setHousingType(opt.key)}
                accessibilityRole="button"
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Field
          label="Surface (m²)"
          value={surface}
          onChangeText={setSurface}
          keyboardType="numeric"
          error={err('surface')}
        />
        <Field
          label="Code postal"
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="numeric"
          maxLength={5}
          error={err('postalCode')}
        />

        <Text style={styles.section}>Travaux souhaités</Text>

        <View style={styles.chips}>
          {WORK_OPTIONS.map((opt) => {
            const active = workTypes.has(opt.key);
            return (
              <Pressable
                key={opt.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleWork(opt.key)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {err('workTypes') ? <Text style={styles.errorText}>{err('workTypes')}</Text> : null}

        <Text style={styles.label}>Message (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Précisions, contraintes, budget estimé…"
          multiline
          numberOfLines={4}
        />

        <Pressable
          style={[styles.submit, (!isValid || submitting) && styles.submitDisabled]}
          onPress={submit}
          disabled={submitting}
          accessibilityRole="button"
        >
          <Text style={styles.submitText}>{submitting ? 'Envoi…' : 'Envoyer ma demande'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
};

function Field({
  label,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
}: FieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !!error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, gap: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  subtitle: { fontSize: 13, color: '#555', marginTop: 4, marginBottom: 12 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f6feb',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  fieldBlock: { marginBottom: 10 },
  label: { fontSize: 13, color: '#333', marginBottom: 4, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#d6d8dc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  inputError: { borderColor: '#d0201c' },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  errorText: { color: '#d0201c', fontSize: 12, marginTop: 2 },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d6d8dc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  segmentActive: { backgroundColor: '#1f6feb' },
  segmentText: { fontSize: 13, color: '#333', fontWeight: '500' },
  segmentTextActive: { color: '#fff' },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d6d8dc',
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#eef4ff', borderColor: '#1f6feb' },
  chipText: { fontSize: 13, color: '#333' },
  chipTextActive: { color: '#1f6feb', fontWeight: '600' },
  submit: {
    backgroundColor: '#1f6feb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitDisabled: { backgroundColor: '#9bbcf0' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

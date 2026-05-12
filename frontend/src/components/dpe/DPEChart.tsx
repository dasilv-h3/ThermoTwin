import { StyleSheet, Text, View } from 'react-native';

import DPEScale from './DPEScale';
import {
  CONSUMPTION_BANDS,
  CONSUMPTION_PALETTE,
  EMISSIONS_BANDS,
  EMISSIONS_PALETTE,
  classifyDpe,
} from './dpeScales';

type Props = {
  // Consommation énergétique primaire (kWhEP/m²·an).
  consumption: number;
  // Émissions GES (kgeqCO2/m²·an).
  emissions: number;
};

// Composant DPE officiel A-G ADEME : 2 jauges côte à côte, classe pointée par
// une flèche noire à droite. Reproduit le visuel réglementaire utilisé sur
// les diagnostics de performance énergétique français.
export default function DPEChart({ consumption, emissions }: Props) {
  const energyClass = classifyDpe(consumption, CONSUMPTION_BANDS);
  const gesClass = classifyDpe(emissions, EMISSIONS_BANDS);

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.title}>Consommations énergétiques</Text>
        <Text style={styles.subtitleTop}>Logement économe</Text>
        <DPEScale bands={CONSUMPTION_BANDS} palette={CONSUMPTION_PALETTE} highlight={energyClass} />
        <Text style={styles.subtitleBottom}>Logement énergivore</Text>
        <Text style={styles.unit}>Unité de mesure exprimée en kWhEP/m².an</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.title}>Émissions de gaz à effet de serre</Text>
        <Text style={styles.subtitleTop}>Faible émission de GES</Text>
        <DPEScale bands={EMISSIONS_BANDS} palette={EMISSIONS_PALETTE} highlight={gesClass} />
        <Text style={styles.subtitleBottom}>Forte émission de GES</Text>
        <Text style={styles.unit}>Unité de mesure exprimée en kgeqCO2/m².an</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 12 },
  panel: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e3e7ee',
    gap: 4,
  },
  title: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  subtitleTop: { fontSize: 11, fontWeight: '600', color: '#414c5c', marginBottom: 4 },
  subtitleBottom: { fontSize: 11, fontWeight: '600', color: '#414c5c', marginTop: 4 },
  unit: { fontSize: 10, color: '#5f6b7f', marginTop: 6 },
});

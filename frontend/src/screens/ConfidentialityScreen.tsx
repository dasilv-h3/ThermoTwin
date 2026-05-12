import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { RootStackParamList } from '../navigation/RootNavigator';
import { exportData } from '../services/authService';
import { deleteAccountThunk } from '../store/authSlice';
import { useAppDispatch } from '../store/hooks';

type Props = NativeStackScreenProps<RootStackParamList, 'Confidentiality'>;

export default function ConfidentialityScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const data = await exportData();
      const json = JSON.stringify(data, null, 2);
      const fileName = `thermotwin-export-${new Date().toISOString().split('T')[0]}.json`;

      const file = new File(Paths.cache, fileName);
      if (file.exists) {
        file.delete();
      }
      file.create();
      file.write(json);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Mes données ThermoTwin',
        });
      } else {
        Alert.alert('Export réussi', `Fichier sauvegardé : ${file.uri}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Export impossible';
      Alert.alert('Erreur', message);
    } finally {
      setExporting(false);
    }
  }

  function confirmDeletion() {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irréversible. Toutes vos données seront définitivement supprimées (profil, scans, historique).',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: confirmAgain,
        },
      ],
    );
  }

  function confirmAgain() {
    Alert.alert('Êtes-vous sûr ?', 'Cette action ne peut pas être annulée. Continuer ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui, supprimer', style: 'destructive', onPress: handleDelete },
    ]);
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const result = await dispatch(deleteAccountThunk());
      if (deleteAccountThunk.fulfilled.match(result)) {
        Alert.alert('Compte supprimé', 'Votre compte a été supprimé. À bientôt.');
        // Navigation auto vers Welcome via isAuthenticated
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer le compte. Réessayez plus tard.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confidentialité</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={48} color="#00d4ff" />
        </View>
        <Text style={styles.title}>Vos données personnelles</Text>
        <Text style={styles.subtitle}>
          Conformément au RGPD, vous avez le contrôle total sur vos données.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données stockées</Text>
          <Text style={styles.sectionText}>
            Nous stockons votre nom, votre email et l&apos;historique de vos scans thermiques. Vos
            mots de passe sont hachés et ne sont jamais accessibles.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos droits</Text>
          <Text style={styles.sectionText}>
            Vous pouvez à tout moment modifier vos informations depuis votre profil, télécharger une
            copie de vos données ou demander la suppression complète de votre compte.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator color="#00d4ff" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#00d4ff" />
              <Text style={styles.exportText}>Télécharger mes données</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Zone de danger</Text>
          <Text style={styles.dangerText}>
            La suppression du compte est définitive. Toutes vos données (profil, scans, historique)
            seront effacées de nos serveurs et ne pourront pas être récupérées.
          </Text>
          <TouchableOpacity
            style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
            onPress={confirmDeletion}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ff6b6b" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                <Text style={styles.deleteText}>Supprimer mon compte</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 28,
  },
  section: {
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  dangerSection: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  dangerTitle: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dangerText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#00d4ff',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 8,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportText: {
    color: '#00d4ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

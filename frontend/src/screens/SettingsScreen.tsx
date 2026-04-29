import { Pressable, StyleSheet, Text, View } from 'react-native';

import { logoutThunk } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  function handleLogout() {
    dispatch(logoutThunk());
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paramètres</Text>

      {user && (
        <Text style={styles.email}>
          Connecté en tant que {user.email}
        </Text>
      )}

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#c00',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

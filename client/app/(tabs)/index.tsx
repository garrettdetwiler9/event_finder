import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Finder</Text>
      <Text style={styles.subtitle}>Welcome, {auth.currentUser?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={() => signOut(auth)}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const PRIMARY = '#4f46e5';
const WHITE = '#fff';
const MUTED = '#666';

const styles = StyleSheet.create({
  button: { backgroundColor: PRIMARY, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  buttonText: { color: WHITE, fontWeight: '600' },
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  subtitle: { color: MUTED, fontSize: 16, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
});

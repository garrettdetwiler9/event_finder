import '../global.css';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Stack, router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setLoggedIn(!!user);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (loggedIn) {
      router.replace('/discover');
    } else {
      router.replace('/(auth)/login');
    }
  }, [ready, loggedIn]);

  if (!ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loader: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});

import '../global.css';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Stack, router } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';

function RootNavigator() {
  const { firebaseUser, userProfile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace('/(auth)/login');
    } else if (!userProfile) {
      router.replace('/onboarding');
    } else {
      router.replace('/discover');
    }
  }, [loading, firebaseUser, userProfile]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loader: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});

import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LogOut, Users, Calendar, Star } from 'lucide-react-native';
import { useAuthContext } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
  const { userProfile, signOut } = useAuthContext();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          await signOut();
        },
      },
    ]);
  };

  if (!userProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const accountTypeLabel =
    userProfile.accountType === 'org'
      ? 'Organization'
      : userProfile.accountType === 'business'
        ? 'Business'
        : 'Member';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar + name */}
      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {userProfile.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.displayName}>{userProfile.displayName}</Text>
        <Text style={styles.username}>@{userProfile.username}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{accountTypeLabel}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Users size={22} color={Colors.primary} />
          <Text style={styles.statValue}>{userProfile.friends.length}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={22} color={Colors.secondary} />
          <Text style={styles.statValue}>—</Text>
          <Text style={styles.statLabel}>Attended</Text>
        </View>
        <View style={styles.statCard}>
          <Star size={22} color="#f97316" />
          <Text style={styles.statValue}>—</Text>
          <Text style={styles.statLabel}>Hosted</Text>
        </View>
      </View>

      {/* Sign out */}
      <Pressable
        style={[styles.signOutButton, signingOut && styles.signOutButtonDisabled]}
        onPress={handleSignOut}
        disabled={signingOut}
      >
        {signingOut ? (
          <ActivityIndicator size="small" color={Colors.error} />
        ) : (
          <>
            <LogOut size={18} color={Colors.error} />
            <Text style={styles.signOutText}>Sign out</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 12,
    width: 80,
  },
  avatarInitial: { color: Colors.white, fontSize: 36, fontWeight: '700' },
  card: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    elevation: 3,
    marginBottom: 16,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  displayName: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  header: {
    backgroundColor: Colors.primary,
    marginBottom: 20,
    marginHorizontal: -20,
    marginTop: -20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  headerTitle: { color: Colors.white, fontSize: 24, fontWeight: '700' },
  signOutButton: {
    alignItems: 'center',
    borderColor: Colors.error,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 14,
  },
  signOutButtonDisabled: { opacity: 0.5 },
  signOutText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
  statCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    elevation: 2,
    flex: 1,
    gap: 4,
    paddingVertical: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '500' },
  statValue: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeBadge: {
    backgroundColor: Colors.categoryBadgeBg,
    borderRadius: 20,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  typeBadgeText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  username: { color: Colors.textSecondary, fontSize: 15 },
});

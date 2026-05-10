import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { User, Users, Calendar, LogOut, ChevronRight, BarChart2, Settings } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { format, differenceInYears } from 'date-fns';

export default function ProfileScreen() {
  const { userProfile, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          await signOut();
        },
      },
    ]);
  };

  if (!userProfile) return null;

  const friendCount = (userProfile.friends as any[]).length;
  const age = userProfile.birthdate
    ? differenceInYears(new Date(), new Date(userProfile.birthdate))
    : null;

  const isHost = userProfile.accountType === 'business' || userProfile.accountType === 'org';

  const MenuItem = ({
    icon,
    label,
    onPress,
    danger,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={[styles.menuItemText, danger && { color: Colors.error }]}>{label}</Text>
      </View>
      <ChevronRight size={18} color={danger ? Colors.error : Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar & name */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          {userProfile.avatarUrl ? (
            <Image source={{ uri: userProfile.avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarInitial}>
              {userProfile.displayName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={styles.displayName}>{userProfile.displayName}</Text>
        <Text style={styles.username}>@{userProfile.username}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: accountTypeColor(userProfile.accountType) + '20' }]}>
            <Text style={[styles.badgeText, { color: accountTypeColor(userProfile.accountType) }]}>
              {userProfile.accountType.toUpperCase()}
            </Text>
          </View>
          {userProfile.verified && (
            <View style={[styles.badge, { backgroundColor: '#d1fae5' }]}>
              <Text style={[styles.badgeText, { color: '#065f46' }]}>VERIFIED</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{friendCount}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{userProfile.checkins.length}</Text>
          <Text style={styles.statLabel}>Check-ins</Text>
        </View>
        {age !== null && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{age}</Text>
              <Text style={styles.statLabel}>Age</Text>
            </View>
          </>
        )}
        {userProfile.birthdate && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{format(new Date(userProfile.birthdate), 'MMM d')}</Text>
              <Text style={styles.statLabel}>Birthday</Text>
            </View>
          </>
        )}
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <MenuItem
          icon={<Users size={20} color={Colors.brand} />}
          label="Friends"
          onPress={() => router.push('/friends' as any)}
        />
        <MenuItem
          icon={<Calendar size={20} color={Colors.brand} />}
          label="My Events"
          onPress={() => router.push('/my-events' as any)}
        />
        {isHost && (
          <MenuItem
            icon={<BarChart2 size={20} color={Colors.brand} />}
            label="Host Dashboard"
            onPress={() => router.push('/host-dashboard' as any)}
          />
        )}
        <MenuItem
          icon={<Settings size={20} color={Colors.brand} />}
          label="Edit Profile"
          onPress={() => router.push('/edit-profile' as any)}
        />
      </View>

      <View style={styles.section}>
        <MenuItem
          icon={<LogOut size={20} color={Colors.error} />}
          label={signingOut ? 'Signing out...' : 'Sign Out'}
          onPress={handleSignOut}
          danger
        />
      </View>
    </ScrollView>
  );
}

function accountTypeColor(type: string) {
  if (type === 'business') return '#f59e0b';
  if (type === 'org') return '#8b5cf6';
  return Colors.brand;
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', backgroundColor: Colors.brand, borderRadius: 48, height: 96, justifyContent: 'center', width: 96 },
  avatarImg: { borderRadius: 48, height: 96, width: 96 },
  avatarInitial: { color: Colors.white, fontSize: 38, fontWeight: '700' },
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  container: { backgroundColor: '#faf5ff', flex: 1 },
  content: { paddingBottom: 100 },
  displayName: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700', marginTop: 12 },
  hero: { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  menuItem: { alignItems: 'center', backgroundColor: Colors.white, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuItemLeft: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  menuItemText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '500' },
  section: { backgroundColor: Colors.white, borderRadius: 14, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden' },
  sectionTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, textTransform: 'uppercase' },
  statDivider: { backgroundColor: Colors.border, height: 30, width: 1 },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  statNum: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' },
  stats: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: 14, flexDirection: 'row', marginHorizontal: 16, marginBottom: 20, paddingVertical: 16 },
  username: { color: Colors.textSecondary, fontSize: 15, marginTop: 2 },
});

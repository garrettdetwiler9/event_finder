import { View, Text, ScrollView, Pressable, StyleSheet, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Mail,
  MapPin,
  Bell,
  Lock,
  Heart,
  HelpCircle,
  LogOut,
  ChevronRight,
  Settings,
  Shield,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';

type SettingsItem = {
  icon: ComponentType<LucideProps>;
  label: string;
  color: string;
  onPress?: () => void;
  danger?: boolean;
};

type SettingsSection = { title: string; items: SettingsItem[] };

export function ProfilePage() {
  const { userProfile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const sections: SettingsSection[] = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', color: Colors.primary },
        { icon: Mail, label: 'Email Preferences', color: Colors.secondary },
        { icon: MapPin, label: 'Location Settings', color: '#f97316' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', color: Colors.primary },
        { icon: Lock, label: 'Privacy & Security', color: Colors.secondary },
        { icon: Heart, label: 'Interests', color: '#f97316' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', color: Colors.primary },
        { icon: Settings, label: 'App Settings', color: Colors.secondary },
        {
          icon: LogOut,
          label: 'Sign Out',
          color: Colors.error,
          onPress: handleSignOut,
          danger: true,
        },
      ],
    },
  ];

  const initials = userProfile
    ? userProfile.displayName
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const accountTypeBadge: Record<string, string> = {
    user: 'User',
    business: 'Business',
    org: 'Organization',
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#9333ea', '#ec4899', '#f97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Profile</Text>
      </LinearGradient>

      <View style={styles.cardWrapper}>
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            {userProfile?.avatarUrl ? (
              <Image source={{ uri: userProfile.avatarUrl }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={['#9333ea', '#ec4899']} style={styles.avatarPlaceholder}>
                <Text style={styles.initials}>{initials}</Text>
              </LinearGradient>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>{userProfile?.displayName ?? 'Loading…'}</Text>
              <Text style={styles.username}>@{userProfile?.username ?? '—'}</Text>
              {userProfile && (
                <View style={styles.accountBadge}>
                  <Shield size={12} color={Colors.primary} />
                  <Text style={styles.accountBadgeText}>
                    {accountTypeBadge[userProfile.accountType]}
                    {userProfile.verified ? ' · Verified' : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile?.friends.length ?? 0}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Attending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Hosting</Text>
            </View>
          </View>
        </View>

        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Pressable
                    key={item.label}
                    onPress={item.onPress}
                    style={({ pressed }) => [
                      styles.settingsItem,
                      idx < section.items.length - 1 && styles.settingsItemBorder,
                      pressed && styles.settingsItemPressed,
                    ]}
                  >
                    <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                      <Icon size={18} color={item.color} />
                    </View>
                    <Text style={[styles.settingsLabel, item.danger && styles.settingsLabelDanger]}>
                      {item.label}
                    </Text>
                    <ChevronRight size={18} color={Colors.textSecondary} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Text style={styles.footer}>Event Finder v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  accountBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  accountBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  avatar: {
    borderColor: Colors.white,
    borderRadius: 40,
    borderWidth: 3,
    height: 80,
    width: 80,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  cardWrapper: {
    marginTop: -24,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  container: { backgroundColor: Colors.backgroundMuted, flex: 1 },
  displayName: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  footer: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 24,
    textAlign: 'center',
  },
  header: { paddingBottom: 48, paddingHorizontal: 20, paddingTop: 56 },
  headerTitle: { color: Colors.white, fontSize: 26, fontWeight: '700' },
  iconBox: {
    alignItems: 'center',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  initials: { color: Colors.white, fontSize: 28, fontWeight: '700' },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    elevation: 4,
    marginBottom: 20,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  section: { marginBottom: 16 },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  settingsItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsItemBorder: {
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsItemPressed: { backgroundColor: Colors.backgroundMuted },
  settingsLabel: { color: Colors.textPrimary, flex: 1, fontSize: 15 },
  settingsLabelDanger: { color: Colors.error },
  statDivider: {
    backgroundColor: Colors.border,
    height: 32,
    width: StyleSheet.hairlineWidth,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  statValue: { color: Colors.primary, fontSize: 22, fontWeight: '700' },
  statsRow: {
    alignItems: 'center',
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingTop: 16,
  },
  userInfo: { flex: 1 },
  username: { color: Colors.textSecondary, fontSize: 15, marginTop: 2 },
});

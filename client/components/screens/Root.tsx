import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Compass, CalendarDays, Map, Trophy, User } from 'lucide-react-native';
import type { LucideProps } from 'lucide-react-native';
import type { ComponentType } from 'react';

const ACTIVE_COLOR = '#9333ea';
const INACTIVE_COLOR = '#6b7280';
const ACTIVE_TAB_BG = '#f3e8ff';
const TAB_BAR_BG = '#ffffff';
const BORDER_COLOR = '#e5e7eb';

const tabs: { path: Href; icon: ComponentType<LucideProps>; label: string }[] = [
  { path: '/discover', icon: Compass, label: 'Discover' },
  { path: '/my-events', icon: CalendarDays, label: 'My Events' },
  { path: '/map', icon: Map, label: 'Map' },
  { path: '/achievements', icon: Trophy, label: 'Achievements' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Root() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {tabs.map(({ path, icon: Icon, label }) => {
        const isActive = pathname === String(path);
        return (
          <Pressable
            key={String(path)}
            onPress={() => router.push(path)}
            style={[styles.tab, isActive ? styles.activeTab : null]}
          >
            <Icon size={24} color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR} />
            <Text style={[styles.label, isActive ? styles.activeLabel : null]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeLabel: { color: ACTIVE_COLOR },
  activeTab: { backgroundColor: ACTIVE_TAB_BG },
  container: {
    alignItems: 'center',
    backgroundColor: TAB_BAR_BG,
    borderTopColor: BORDER_COLOR,
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 80,
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  label: { color: INACTIVE_COLOR, fontSize: 12, fontWeight: '500', marginTop: 4 },
  tab: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

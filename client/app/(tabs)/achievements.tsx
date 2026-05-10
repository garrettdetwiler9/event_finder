import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Trophy, Star, Users, Calendar, Compass, Zap } from 'lucide-react-native';
import type { LucideProps } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { getEvents, type Event } from '@/lib/api';
import { Colors } from '@/constants/Colors';

interface Achievement {
  id: string;
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  color: string;
  unlocked: boolean;
}

function buildAchievements(hosted: number, attended: number, friends: number): Achievement[] {
  return [
    {
      id: 'first_join',
      icon: Star,
      title: 'First Steps',
      description: 'Join your first event',
      color: '#f59e0b',
      unlocked: attended >= 1,
    },
    {
      id: 'social_butterfly',
      icon: Users,
      title: 'Social Butterfly',
      description: 'Attend 5 events',
      color: '#ec4899',
      unlocked: attended >= 5,
    },
    {
      id: 'regular',
      icon: Calendar,
      title: 'Regular',
      description: 'Attend 10 events',
      color: '#9333ea',
      unlocked: attended >= 10,
    },
    {
      id: 'host',
      icon: Zap,
      title: 'Host',
      description: 'Create your first event',
      color: '#f97316',
      unlocked: hosted >= 1,
    },
    {
      id: 'organizer',
      icon: Trophy,
      title: 'Organizer',
      description: 'Host 5 events',
      color: '#16a34a',
      unlocked: hosted >= 5,
    },
    {
      id: 'explorer',
      icon: Compass,
      title: 'Explorer',
      description: 'Add 3 friends',
      color: '#0ea5e9',
      unlocked: friends >= 3,
    },
  ];
}

export default function AchievementsScreen() {
  const { userProfile } = useAuthContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch {
      // keep stale
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const myId = userProfile?._id ?? '';

  const hosted = events.filter((e: Event) => {
    const creatorId = typeof e.creator === 'string' ? e.creator : (e.creator as any)._id;
    return creatorId === myId;
  }).length;

  const attended = events.filter((e: Event) => {
    const creatorId = typeof e.creator === 'string' ? e.creator : (e.creator as any)._id;
    return creatorId !== myId && (e.attendees as string[]).includes(myId);
  }).length;

  const friends = userProfile?.friends.length ?? 0;
  const achievements = buildAchievements(hosted, attended, friends);
  const unlocked = achievements.filter((a: Achievement) => a.unlocked).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
      </View>

      <View style={styles.summaryCard}>
        <Trophy size={32} color={Colors.primary} />
        <Text style={styles.summaryCount}>{unlocked}/{achievements.length}</Text>
        <Text style={styles.summaryLabel}>Achievements unlocked</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{attended}</Text>
          <Text style={styles.statLabel}>Attended</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{hosted}</Text>
          <Text style={styles.statLabel}>Hosted</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{friends}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>All achievements</Text>
      <View style={styles.grid}>
        {achievements.map((achievement: Achievement) => {
          const Icon = achievement.icon;
          return (
            <View
              key={achievement.id}
              style={[styles.achievementCard, !achievement.unlocked && styles.achievementLocked]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: achievement.unlocked ? achievement.color + '20' : '#f3f4f6' },
                ]}
              >
                <Icon
                  size={28}
                  color={achievement.unlocked ? achievement.color : '#d1d5db'}
                />
              </View>
              <Text
                style={[
                  styles.achievementTitle,
                  !achievement.unlocked && styles.achievementTitleLocked,
                ]}
              >
                {achievement.title}
              </Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
              {achievement.unlocked && (
                <View style={styles.unlockedBadge}>
                  <Text style={styles.unlockedBadgeText}>✓ Unlocked</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  achievementCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    flex: 1,
    minWidth: '45%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  achievementDesc: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  achievementLocked: { opacity: 0.6 },
  achievementTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementTitleLocked: { color: Colors.textSecondary },
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  container: { flex: 1 },
  content: { paddingBottom: 60 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  statDivider: { backgroundColor: Colors.border, width: 1 },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  statValue: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700' },
  statsRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
    gap: 4,
    margin: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryCount: { color: Colors.textPrimary, fontSize: 36, fontWeight: '800' },
  summaryLabel: { color: Colors.textSecondary, fontSize: 14 },
  unlockedBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unlockedBadgeText: { color: '#16a34a', fontSize: 11, fontWeight: '600' },
});

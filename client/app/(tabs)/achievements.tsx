import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Trophy, MapPin, Users, Star, Zap, Award } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';

interface Achievement {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: { current: number; total: number };
}

export default function AchievementsScreen() {
  const { userProfile } = useAuth();

  const checkinCount = userProfile?.checkins?.length ?? 0;
  const friendCount = (userProfile?.friends as any[])?.length ?? 0;

  const achievements: Achievement[] = [
    {
      id: 'first_checkin',
      icon: <MapPin size={28} color={checkinCount >= 1 ? '#f59e0b' : Colors.textPlaceholder} />,
      title: 'First Steps',
      description: 'Check in to your first event',
      unlocked: checkinCount >= 1,
      progress: { current: Math.min(checkinCount, 1), total: 1 },
    },
    {
      id: 'explorer',
      icon: <Zap size={28} color={checkinCount >= 5 ? '#f59e0b' : Colors.textPlaceholder} />,
      title: 'Explorer',
      description: 'Check in to 5 events',
      unlocked: checkinCount >= 5,
      progress: { current: Math.min(checkinCount, 5), total: 5 },
    },
    {
      id: 'social_butterfly',
      icon: <Users size={28} color={friendCount >= 5 ? '#f59e0b' : Colors.textPlaceholder} />,
      title: 'Social Butterfly',
      description: 'Add 5 friends',
      unlocked: friendCount >= 5,
      progress: { current: Math.min(friendCount, 5), total: 5 },
    },
    {
      id: 'adventurer',
      icon: <Star size={28} color={checkinCount >= 10 ? '#f59e0b' : Colors.textPlaceholder} />,
      title: 'Adventurer',
      description: 'Check in to 10 events',
      unlocked: checkinCount >= 10,
      progress: { current: Math.min(checkinCount, 10), total: 10 },
    },
    {
      id: 'connector',
      icon: <Users size={28} color={friendCount >= 10 ? '#f59e0b' : Colors.textPlaceholder} />,
      title: 'Connector',
      description: 'Add 10 friends',
      unlocked: friendCount >= 10,
      progress: { current: Math.min(friendCount, 10), total: 10 },
    },
    {
      id: 'legend',
      icon: <Award size={28} color={checkinCount >= 25 ? '#f59e0b' : Colors.textPlaceholder} />,
      title: 'Davis Legend',
      description: 'Check in to 25 events',
      unlocked: checkinCount >= 25,
      progress: { current: Math.min(checkinCount, 25), total: 25 },
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Trophy size={28} color="#f59e0b" />
        <Text style={styles.title}>Achievements</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryNum}>{unlockedCount}/{achievements.length}</Text>
        <Text style={styles.summaryLabel}>Unlocked</Text>
        <Text style={styles.summarySubtext}>{checkinCount} check-ins · {friendCount} friends</Text>
      </View>

      <Text style={styles.sectionTitle}>All Badges</Text>
      {achievements.map(a => (
        <View key={a.id} style={[styles.card, !a.unlocked && styles.cardLocked]}>
          <View style={[styles.iconBox, a.unlocked && styles.iconBoxUnlocked]}>
            {a.icon}
          </View>
          <View style={styles.info}>
            <Text style={[styles.achievementTitle, !a.unlocked && styles.textLocked]}>{a.title}</Text>
            <Text style={styles.achievementDesc}>{a.description}</Text>
            {a.progress && (
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${(a.progress.current / a.progress.total) * 100}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>{a.progress.current}/{a.progress.total}</Text>
              </View>
            )}
          </View>
          {a.unlocked && <Trophy size={16} color="#f59e0b" />}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  achievementDesc: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  achievementTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  card: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: 14, flexDirection: 'row', gap: 14, marginBottom: 10, padding: 14 },
  cardLocked: { opacity: 0.55 },
  container: { backgroundColor: '#faf5ff', flex: 1 },
  content: { paddingBottom: 100, paddingHorizontal: 16 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 10, paddingTop: 60, paddingBottom: 20 },
  iconBox: { alignItems: 'center', backgroundColor: Colors.border + '50', borderRadius: 40, height: 56, justifyContent: 'center', width: 56 },
  iconBoxUnlocked: { backgroundColor: '#fef3c7' },
  info: { flex: 1 },
  progressBar: { backgroundColor: Colors.border, borderRadius: 4, flex: 1, height: 6 },
  progressFill: { backgroundColor: '#f59e0b', borderRadius: 4, height: 6 },
  progressRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 6 },
  progressText: { color: Colors.textSecondary, fontSize: 11 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase' },
  summaryCard: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, marginBottom: 24, padding: 24 },
  summaryLabel: { color: Colors.textSecondary, fontSize: 14, marginTop: 2 },
  summaryNum: { color: '#f59e0b', fontSize: 40, fontWeight: '800' },
  summarySubtext: { color: Colors.textPlaceholder, fontSize: 13, marginTop: 6 },
  textLocked: { color: Colors.textSecondary },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '700' },
});

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Calendar, Users, Star, TrendingUp, Award } from 'lucide-react-native';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import { CartesianChart, Bar, Line } from 'victory-native';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';

const MONTHLY_DATA = [
  { month: 'Jan', attended: 4, hosted: 1 },
  { month: 'Feb', attended: 6, hosted: 2 },
  { month: 'Mar', attended: 8, hosted: 1 },
  { month: 'Apr', attended: 5, hosted: 3 },
  { month: 'May', attended: 7, hosted: 2 },
];

type Achievement = {
  id: number;
  title: string;
  description: string;
  current: number;
  goal: number;
  icon: ComponentType<LucideProps>;
  color: string;
  progressColor: string;
};

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    title: 'Social Butterfly',
    description: 'Attend 10 events',
    current: 7,
    goal: 10,
    icon: Users,
    color: '#f3e8ff',
    progressColor: Colors.primary,
  },
  {
    id: 2,
    title: 'Event Host',
    description: 'Host 5 events',
    current: 4,
    goal: 5,
    icon: Star,
    color: '#fce7f3',
    progressColor: Colors.secondary,
  },
  {
    id: 3,
    title: 'Weekly Warrior',
    description: 'Attend events 4 weeks in a row',
    current: 2,
    goal: 4,
    icon: TrendingUp,
    color: '#fff7ed',
    progressColor: '#f97316',
  },
  {
    id: 4,
    title: 'Category Explorer',
    description: 'Try 5 different categories',
    current: 3,
    goal: 5,
    icon: Award,
    color: '#f3e8ff',
    progressColor: Colors.primary,
  },
];

export function AchievementsPage() {
  const { userProfile } = useAuth();

  const statsCards = [
    {
      label: 'Friends',
      value: userProfile?.friends.length ?? 0,
      icon: Users,
      colors: ['#9333ea', '#7c3aed'] as [string, string],
    },
    {
      label: 'Hosting',
      value: '—',
      icon: Star,
      colors: ['#ec4899', '#db2777'] as [string, string],
    },
    {
      label: 'Attending',
      value: '—',
      icon: Calendar,
      colors: ['#f97316', '#ea580c'] as [string, string],
    },
    {
      label: 'Points',
      value: 1250,
      icon: Trophy,
      colors: ['#9333ea', '#ec4899'] as [string, string],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#9333ea', '#ec4899', '#f97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Achievements</Text>
        <Text style={styles.headerSub}>Track your social journey</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsCards.map(stat => {
            const Icon = stat.icon;
            return (
              <LinearGradient key={stat.label} colors={stat.colors} style={styles.statCard}>
                <Icon size={28} color="rgba(255,255,255,0.85)" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            );
          })}
        </View>

        {/* Activity Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <TrendingUp size={18} color={Colors.primary} />
            <Text style={styles.chartTitle}>Activity Over Time</Text>
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>Attended</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
              <Text style={styles.legendText}>Hosted</Text>
            </View>
          </View>
          <CartesianChart
            data={MONTHLY_DATA}
            xKey="month"
            yKeys={['attended', 'hosted']}
            domainPadding={{ left: 20, right: 20 }}
            axisOptions={{ labelColor: Colors.textSecondary, lineColor: Colors.border }}
          >
            {({ points }) => (
              <>
                <Line
                  points={points.attended}
                  color={Colors.primary}
                  strokeWidth={2.5}
                  animate={{ type: 'spring' }}
                />
                <Line
                  points={points.hosted}
                  color={Colors.secondary}
                  strokeWidth={2.5}
                  animate={{ type: 'spring' }}
                />
              </>
            )}
          </CartesianChart>
        </View>

        {/* Monthly Bar Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Trophy size={18} color={Colors.secondary} />
            <Text style={styles.chartTitle}>Monthly Breakdown</Text>
          </View>
          <CartesianChart
            data={MONTHLY_DATA}
            xKey="month"
            yKeys={['attended', 'hosted']}
            domainPadding={{ left: 20, right: 20 }}
            axisOptions={{ labelColor: Colors.textSecondary, lineColor: Colors.border }}
          >
            {({ points, chartBounds }) => (
              <>
                <Bar
                  points={points.attended}
                  chartBounds={chartBounds}
                  color={Colors.primary}
                  roundedCorners={{ topLeft: 6, topRight: 6 }}
                  animate={{ type: 'spring' }}
                />
                <Bar
                  points={points.hosted}
                  chartBounds={chartBounds}
                  color={Colors.secondary}
                  roundedCorners={{ topLeft: 6, topRight: 6 }}
                  animate={{ type: 'spring' }}
                />
              </>
            )}
          </CartesianChart>
        </View>

        {/* Achievement Progress */}
        <View style={styles.achievementsSection}>
          <View style={styles.chartHeader}>
            <Trophy size={18} color="#f97316" />
            <Text style={styles.chartTitle}>Achievement Progress</Text>
          </View>
          {ACHIEVEMENTS.map(a => {
            const Icon = a.icon;
            const pct = Math.round((a.current / a.goal) * 100);
            return (
              <View key={a.id} style={styles.achievementCard}>
                <View style={[styles.achievementIcon, { backgroundColor: a.color }]}>
                  <Icon size={22} color={a.progressColor} />
                </View>
                <View style={styles.achievementBody}>
                  <Text style={styles.achievementTitle}>{a.title}</Text>
                  <Text style={styles.achievementDesc}>{a.description}</Text>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressCount}>
                      {a.current} / {a.goal}
                    </Text>
                    <Text style={[styles.progressPct, { color: a.progressColor }]}>{pct}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct}%`, backgroundColor: a.progressColor },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  achievementBody: { flex: 1 },
  achievementCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    padding: 16,
  },
  achievementDesc: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  achievementIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  achievementTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  achievementsSection: { gap: 0 },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    elevation: 3,
    height: 260,
    marginBottom: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  chartHeader: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 8 },
  chartLegend: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  chartTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  container: { backgroundColor: Colors.backgroundMuted, flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: { paddingBottom: 20, paddingHorizontal: 20, paddingTop: 56 },
  headerSub: { color: Colors.whiteAlpha80, fontSize: 14, marginTop: 2 },
  headerTitle: { color: Colors.white, fontSize: 26, fontWeight: '700' },
  legendDot: { borderRadius: 5, height: 10, width: 10 },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  legendText: { color: Colors.textSecondary, fontSize: 13 },
  progressCount: { color: Colors.textSecondary, flex: 1, fontSize: 13 },
  progressFill: { borderRadius: 4, height: '100%' },
  progressPct: { fontSize: 13, fontWeight: '700' },
  progressRow: { flexDirection: 'row', marginBottom: 6, marginTop: 8 },
  progressTrack: {
    backgroundColor: Colors.border,
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  statCard: {
    borderRadius: 16,
    elevation: 3,
    gap: 6,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    width: '48%',
  },
  statLabel: { color: Colors.whiteAlpha85, fontSize: 13 },
  statValue: { color: Colors.white, fontSize: 28, fontWeight: '700' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

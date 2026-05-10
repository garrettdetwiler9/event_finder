import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Calendar, MapPin, Users, BarChart2, Plus } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { getEvents, getMyEvents, getMyInvites, type Event, type UserInvite } from '@/lib/api';
import { format } from 'date-fns';

type Tab = 'going' | 'hosting' | 'invites';

const CATEGORY_COLORS: Record<string, string> = {
  sports: '#3b82f6', social: '#ec4899', food: '#f97316',
  music: '#8b5cf6', games: '#10b981', hiking: '#84cc16',
  leisure: '#06b6d4', other: '#6b7280',
};

export default function MyEventsScreen() {
  const { userProfile } = useAuth();
  const [tab, setTab] = useState<Tab>('going');
  const [going, setGoing] = useState<Event[]>([]);
  const [hosting, setHosting] = useState<Event[]>([]);
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [goingData, hostingData, inviteData] = await Promise.all([
        getEvents({ userId: userProfile?._id }),
        getMyEvents(),
        getMyInvites(),
      ]);
      // Filter events where the user is an attendee (not necessarily creator)
      const myId = userProfile?._id;
      setGoing(goingData.filter(e =>
        e.attendees.some(a => a._id === myId) && e.creator._id !== myId
      ));
      setHosting(hostingData);
      setInvites(inviteData.filter(i => i.status === 'pending'));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const EventCard = ({ event, showAnalytics }: { event: Event; showAnalytics?: boolean }) => {
    const catColor = CATEGORY_COLORS[event.category] ?? Colors.brand;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/event/${event._id}` as any)}
        activeOpacity={0.85}
      >
        <View style={[styles.categoryBar, { backgroundColor: catColor }]} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{event.title}</Text>
          <View style={styles.meta}>
            <Calendar size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{format(new Date(event.startTime), 'EEE, MMM d · h:mm a')}</Text>
          </View>
          <View style={styles.meta}>
            <MapPin size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{event.address}</Text>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.meta}>
              <Users size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{event.attendees.length} going</Text>
            </View>
            {showAnalytics && (
              <TouchableOpacity
                style={styles.analyticsBtn}
                onPress={() => router.push(`/host-dashboard?eventId=${event._id}` as any)}
              >
                <BarChart2 size={14} color={Colors.brand} />
                <Text style={styles.analyticsBtnText}>Analytics</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.brand} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Events</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/create-event' as any)}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['going', 'hosting', 'invites'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'invites' && invites.length > 0 ? ` (${invites.length})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'going' && (
        <FlatList
          data={going}
          keyExtractor={e => e._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No upcoming events</Text>
              <Text style={styles.emptySubtext}>Discover and RSVP to events you want to attend.</Text>
            </View>
          }
          renderItem={({ item }) => <EventCard event={item} />}
        />
      )}

      {tab === 'hosting' && (
        <FlatList
          data={hosting}
          keyExtractor={e => e._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No events hosted yet</Text>
              <Text style={styles.emptySubtext}>Tap + to create your first event.</Text>
            </View>
          }
          renderItem={({ item }) => <EventCard event={item} showAnalytics />}
        />
      )}

      {tab === 'invites' && (
        <FlatList
          data={invites}
          keyExtractor={i => i.eventId}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No pending invites</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.inviteCard}
              onPress={() => router.push(`/event/${item.eventId}` as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.cardTitle}>{item.event?.title ?? 'Event Invite'}</Text>
              {item.event?.startTime && (
                <View style={styles.meta}>
                  <Calendar size={13} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>
                    {format(new Date(item.event.startTime), 'EEE, MMM d · h:mm a')}
                  </Text>
                </View>
              )}
              <Text style={styles.inviteNote}>Someone invited you — tap to view and RSVP</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { alignItems: 'center', backgroundColor: Colors.brand, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  analyticsBtn: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  analyticsBtnText: { color: Colors.brand, fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: Colors.white, borderRadius: 14, elevation: 2, flexDirection: 'row', marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cardTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  categoryBar: { width: 5 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  container: { backgroundColor: '#faf5ff', flex: 1 },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptySubtext: { color: Colors.textPlaceholder, fontSize: 14, marginTop: 6, textAlign: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  inviteCard: { backgroundColor: Colors.white, borderRadius: 14, marginBottom: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: Colors.primary },
  inviteNote: { color: Colors.primary, fontSize: 12, marginTop: 6, fontWeight: '500' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  meta: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 4 },
  metaText: { color: Colors.textSecondary, fontSize: 12 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: Colors.brand },
  tabText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: Colors.brand, fontWeight: '700' },
  tabs: { backgroundColor: Colors.white, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 12 },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '700' },
});

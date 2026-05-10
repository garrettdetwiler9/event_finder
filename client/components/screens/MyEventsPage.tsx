import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Users, Plus } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import type { IEvent } from '@shared/types';
import { getEvents } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { CreateEventModal } from './CreateEventModal';
import { Colors } from '@/constants/Colors';

const _now = Date.now();

const MOCK_HOSTING: IEvent[] = [
  {
    _id: 'mh1',
    title: 'Evening Volleyball at ARC',
    description: 'Casual co-ed volleyball — all skill levels welcome. Nets are already set up!',
    category: 'sports',
    creator: '__me__',
    location: { type: 'Point', coordinates: [-121.7617, 38.5382] },
    address: 'Activities & Recreation Center, UC Davis',
    startTime: new Date(_now + 6 * 3600_000).toISOString(),
    endTime: new Date(_now + 8 * 3600_000).toISOString(),
    maxAttendees: 12,
    attendees: ['u1', 'u2', 'u3', 'u4'],
    isPublic: true,
    status: 'active',
    createdAt: new Date(_now).toISOString(),
    updatedAt: new Date(_now).toISOString(),
  },
  {
    _id: 'mh2',
    title: 'Weekend Bike Ride to Winters',
    description: 'Scenic 30-mile round trip along the Putah Creek trail. Bring water and snacks!',
    category: 'sports',
    creator: '__me__',
    location: { type: 'Point', coordinates: [-121.7403, 38.5518] },
    address: 'Silo Bike Barn, UC Davis',
    startTime: new Date(_now + 50 * 3600_000).toISOString(),
    endTime: new Date(_now + 55 * 3600_000).toISOString(),
    maxAttendees: 10,
    attendees: ['u1', 'u2'],
    isPublic: true,
    status: 'active',
    createdAt: new Date(_now).toISOString(),
    updatedAt: new Date(_now).toISOString(),
  },
];

const MOCK_ATTENDING: IEvent[] = [
  {
    _id: 'ma1',
    title: 'Board Game Night at CoHo',
    description:
      'Weekly board game night! Catan, Ticket to Ride, Codenames and more. Drop in anytime.',
    category: 'games',
    creator: 'other_user_1',
    location: { type: 'Point', coordinates: [-121.7488, 38.5407] },
    address: 'Coffee House (CoHo), UC Davis',
    startTime: new Date(_now + 26 * 3600_000).toISOString(),
    endTime: new Date(_now + 29 * 3600_000).toISOString(),
    maxAttendees: 16,
    attendees: ['__me__', 'u2', 'u3', 'u4', 'u5', 'u6'],
    isPublic: true,
    status: 'active',
    createdAt: new Date(_now).toISOString(),
    updatedAt: new Date(_now).toISOString(),
  },
  {
    _id: 'ma2',
    title: 'Davis Farmers Market Meetup',
    description:
      "Meet fellow foodies at the Saturday Farmers Market! We'll grab breakfast and explore together.",
    category: 'social',
    creator: 'other_user_2',
    location: { type: 'Point', coordinates: [-121.7405, 38.5449] },
    address: 'Davis Central Park, 4th & C St, Davis, CA',
    startTime: new Date(_now + 72 * 3600_000).toISOString(),
    endTime: new Date(_now + 74.5 * 3600_000).toISOString(),
    maxAttendees: 15,
    attendees: ['__me__', 'u2', 'u3', 'u4', 'u5'],
    isPublic: true,
    status: 'active',
    createdAt: new Date(_now).toISOString(),
    updatedAt: new Date(_now).toISOString(),
  },
];

export function MyEventsPage() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const userId = userProfile?._id;

  const getCreatorId = (creator: IEvent['creator']): string =>
    typeof creator === 'object' && creator !== null
      ? (creator as { _id: string })._id
      : (creator as string);

  const realHosting = events.filter(e => getCreatorId(e.creator) === userId);
  const realAttending = events.filter(
    e => getCreatorId(e.creator) !== userId && e.attendees.includes(userId ?? '')
  );

  // Fall back to mock data when the DB has no events yet (e.g. demo / fresh deploy)
  const hosting = realHosting.length > 0 ? realHosting : MOCK_HOSTING;
  const attending = realAttending.length > 0 ? realAttending : MOCK_ATTENDING;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9333ea', '#ec4899', '#f97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Events</Text>
        <Text style={styles.headerSub}>Your upcoming plans</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} size="large" />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <EventSection
            title="Hosting"
            count={hosting.length}
            events={hosting}
            accentColor={Colors.secondary}
            icon={<Calendar size={18} color={Colors.secondary} />}
            emptyMessage="You haven't created any events yet."
          />

          <EventSection
            title="Attending"
            count={attending.length}
            events={attending}
            accentColor={Colors.primary}
            icon={<Users size={18} color={Colors.primary} />}
            emptyMessage="You haven't joined any events yet."
          />
        </ScrollView>
      )}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setShowCreate(true)}
      >
        <LinearGradient
          colors={['#9333ea', '#ec4899']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus size={28} color={Colors.white} />
        </LinearGradient>
      </Pressable>

      <Modal visible={showCreate} animationType="slide">
        <CreateEventModal
          onClose={() => {
            setShowCreate(false);
            load();
          }}
        />
      </Modal>
    </View>
  );
}

function EventSection({
  title,
  count,
  events,
  accentColor,
  icon,
  emptyMessage,
}: {
  title: string;
  count: number;
  events: IEvent[];
  accentColor: string;
  icon: React.ReactNode;
  emptyMessage: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>
          {title} ({count})
        </Text>
      </View>

      {events.length === 0 ? (
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardRow}
        >
          {events.map(event => (
            <EventCard key={event._id} event={event} accentColor={accentColor} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function EventCard({ event, accentColor }: { event: IEvent; accentColor: string }) {
  const startDate = format(parseISO(event.startTime), 'MMM d');
  const startTime = format(parseISO(event.startTime), 'h:mm a');

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      <View style={styles.cardBody}>
        <View style={[styles.categoryPill, { backgroundColor: `${accentColor}18` }]}>
          <Text style={[styles.categoryText, { color: accentColor }]}>{event.category}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.cardDate}>
          {startDate} · {startTime}
        </Text>
        <Text style={styles.cardAddress} numberOfLines={1}>
          {event.address}
        </Text>
        <View style={styles.attendeeRow}>
          <Users size={12} color={Colors.textSecondary} />
          <Text style={styles.attendeeText}>
            {event.attendees.length}/{event.maxAttendees}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  attendeeRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 8 },
  attendeeText: { color: Colors.textSecondary, fontSize: 12 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    elevation: 3,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    width: 220,
  },
  cardAccent: { height: 4, width: '100%' },
  cardAddress: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  cardBody: { flex: 1, padding: 12 },
  cardDate: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  cardPressed: { opacity: 0.9 },
  cardRow: { paddingBottom: 4, paddingRight: 20 },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  container: { backgroundColor: Colors.backgroundMuted, flex: 1 },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    paddingVertical: 16,
  },
  fab: {
    bottom: 24,
    elevation: 8,
    position: 'absolute',
    right: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabGradient: {
    alignItems: 'center',
    borderRadius: 32,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  fabPressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
  header: { paddingBottom: 20, paddingHorizontal: 20, paddingTop: 56 },
  headerSub: { color: Colors.whiteAlpha80, fontSize: 14, marginTop: 2 },
  headerTitle: { color: Colors.white, fontSize: 26, fontWeight: '700' },
  loader: { flex: 1, marginTop: 60 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 28 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 14 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
});

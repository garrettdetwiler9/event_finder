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

  const hosting = events.filter(e => getCreatorId(e.creator) === userId);

  const attending = events.filter(
    e => getCreatorId(e.creator) !== userId && e.attendees.includes(userId ?? '')
  );

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

      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
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

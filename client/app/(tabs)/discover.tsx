import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { format } from 'date-fns';
import { Calendar, MapPin, Users } from 'lucide-react-native';
import { useAuthContext } from '@/context/AuthContext';
import { getEvents, joinEvent, leaveEvent, type Event, type UserProfile } from '@/lib/api';
import { Colors } from '@/constants/Colors';

const CATEGORIES = [
  { label: 'All', value: undefined },
  { label: 'Sports', value: 'sports' },
  { label: 'Social', value: 'social' },
  { label: 'Hiking', value: 'hiking' },
  { label: 'Games', value: 'games' },
  { label: 'Other', value: 'other' },
] as const;

type CategoryValue = 'sports' | 'social' | 'hiking' | 'games' | 'other' | undefined;

export default function DiscoverScreen() {
  const { userProfile } = useAuthContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<CategoryValue>(undefined);
  const [joining, setJoining] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getEvents(category ? { category } : undefined);
      setEvents(data);
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const handleJoinLeave = async (event: Event) => {
    if (!userProfile) return;
    const attendeeIds = event.attendees as string[];
    const isAttending = attendeeIds.includes(userProfile._id);
    setJoining(event._id);
    try {
      isAttending ? await leaveEvent(event._id) : await joinEvent(event._id);
      setEvents((prev: Event[]) =>
        prev.map((e: Event) => {
          if (e._id !== event._id) return e;
          const next = isAttending
            ? (e.attendees as string[]).filter(id => id !== userProfile._id)
            : [...(e.attendees as string[]), userProfile._id];
          return { ...e, attendees: next };
        })
      );
    } catch {
      // silently ignore — UI state stays as-is if join/leave fails
    }
    setJoining(null);
  };

  const renderEvent = ({ item: event }: { item: Event }) => {
    const attendeeIds = event.attendees as string[];
    const creatorId =
      typeof event.creator === 'string' ? event.creator : (event.creator as UserProfile)._id;
    const isCreator = userProfile?._id === creatorId;
    const isAttending = userProfile ? attendeeIds.includes(userProfile._id) : false;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{event.category}</Text>
          </View>
          {isCreator && (
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>Host</Text>
            </View>
          )}
        </View>

        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText}>
              {format(new Date(event.startTime), 'MMM d, h:mm a')}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.address}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText}>
              {attendeeIds.length}/{event.maxAttendees}
            </Text>
          </View>
        </View>

        {!isCreator && (
          <Pressable
            style={[styles.joinButton, isAttending && styles.leaveButton]}
            onPress={() => handleJoinLeave(event)}
            disabled={joining === event._id}
          >
            {joining === event._id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.joinButtonText}>{isAttending ? 'Leave' : 'Join'}</Text>
            )}
          </Pressable>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Events</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat.label}
            onPress={() => setCategory(cat.value as CategoryValue)}
            style={[styles.filterChip, category === cat.value && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterChipText,
                category === cat.value && styles.filterChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={events}
        keyExtractor={(e: Event) => e._id}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No events found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.categoryBadgeBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 60,
  },
  container: { flex: 1 },
  emptyText: { color: Colors.textSecondary, fontSize: 16 },
  eventDescription: { color: Colors.textSecondary, fontSize: 13, marginBottom: 10 },
  eventTitle: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  filterChip: {
    borderColor: Colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  filterChipTextActive: { color: Colors.white },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10 },
  filterScroll: { maxHeight: 52 },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  headerTitle: { color: Colors.white, fontSize: 24, fontWeight: '700' },
  hostBadge: {
    backgroundColor: Colors.hostBadgeBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hostBadgeText: { color: Colors.hostBadgeText, fontSize: 12, fontWeight: '600' },
  joinButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    marginTop: 12,
    paddingVertical: 10,
  },
  joinButtonText: { color: Colors.white, fontWeight: '600' },
  leaveButton: { backgroundColor: Colors.textSecondary },
  list: { padding: 16 },
  metaItem: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  metaRow: { gap: 6 },
  metaText: { color: Colors.textSecondary, flexShrink: 1, fontSize: 12 },
});

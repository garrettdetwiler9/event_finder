import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Users, Calendar } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import type { IEvent, EventCategory } from '@shared/types';
import { getNearbyEvents, getEvents } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';
import { Colors } from '@/constants/Colors';

const _t = Date.now();

const MOCK_EVENTS = [
  {
    _id: 'disc1',
    title: 'Morning Run at the Arboretum',
    description: 'Relaxed 5K run through the UC Davis Arboretum. All paces welcome!',
    category: 'sports' as EventCategory,
    creator: 'u_seed',
    location: { type: 'Point' as const, coordinates: [-121.7617, 38.5382] as [number, number] },
    address: 'UC Davis Arboretum, Davis, CA',
    startTime: new Date(_t + 2 * 3600_000).toISOString(),
    endTime: new Date(_t + 3.5 * 3600_000).toISOString(),
    maxAttendees: 20,
    attendees: ['u1', 'u2', 'u3', 'u4', 'u5'],
    isPublic: true,
    status: 'active' as const,
    createdAt: new Date(_t).toISOString(),
    updatedAt: new Date(_t).toISOString(),
  },
  {
    _id: 'disc2',
    title: 'Disc Golf at Powerhouse Park',
    description: 'Casual round at Powerhouse — beginners welcome, extra discs available!',
    category: 'sports' as EventCategory,
    creator: 'u_seed2',
    location: { type: 'Point' as const, coordinates: [-121.7403, 38.5518] as [number, number] },
    address: 'Powerhouse Park, Davis, CA',
    startTime: new Date(_t + 5 * 3600_000).toISOString(),
    endTime: new Date(_t + 8 * 3600_000).toISOString(),
    maxAttendees: 12,
    attendees: ['u1', 'u2', 'u3'],
    isPublic: true,
    status: 'active' as const,
    createdAt: new Date(_t).toISOString(),
    updatedAt: new Date(_t).toISOString(),
  },
  {
    _id: 'disc3',
    title: 'Board Game Night at CoHo',
    description: 'Catan, Ticket to Ride, Codenames and more. Drop in anytime!',
    category: 'games' as EventCategory,
    creator: 'u_seed3',
    location: { type: 'Point' as const, coordinates: [-121.7488, 38.5407] as [number, number] },
    address: 'Coffee House (CoHo), UC Davis',
    startTime: new Date(_t + 26 * 3600_000).toISOString(),
    endTime: new Date(_t + 29 * 3600_000).toISOString(),
    maxAttendees: 16,
    attendees: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'],
    isPublic: true,
    status: 'active' as const,
    createdAt: new Date(_t).toISOString(),
    updatedAt: new Date(_t).toISOString(),
  },
  {
    _id: 'disc4',
    title: 'Stebbins Cold Canyon Hike',
    description:
      'Intermediate 7-mile hike with stunning views of Lake Berryessa. Carpooling from campus.',
    category: 'hiking' as EventCategory,
    creator: 'u_seed4',
    location: { type: 'Point' as const, coordinates: [-122.0822, 38.505] as [number, number] },
    address: 'Stebbins Cold Canyon Reserve, Winters, CA',
    startTime: new Date(_t + 48 * 3600_000).toISOString(),
    endTime: new Date(_t + 55 * 3600_000).toISOString(),
    maxAttendees: 10,
    attendees: ['u1', 'u2', 'u3', 'u4'],
    isPublic: true,
    status: 'active' as const,
    createdAt: new Date(_t).toISOString(),
    updatedAt: new Date(_t).toISOString(),
  },
  {
    _id: 'disc5',
    title: 'Farmers Market Meetup',
    description:
      "Meet fellow foodies at the Saturday Farmers Market. We'll grab breakfast and explore together.",
    category: 'social' as EventCategory,
    creator: 'u_seed5',
    location: { type: 'Point' as const, coordinates: [-121.7405, 38.5449] as [number, number] },
    address: 'Davis Central Park, 4th & C St, Davis, CA',
    startTime: new Date(_t + 72 * 3600_000).toISOString(),
    endTime: new Date(_t + 74.5 * 3600_000).toISOString(),
    maxAttendees: 15,
    attendees: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'],
    isPublic: true,
    status: 'active' as const,
    createdAt: new Date(_t).toISOString(),
    updatedAt: new Date(_t).toISOString(),
  },
  {
    _id: 'disc6',
    title: 'Pickup Soccer at Aggie Field',
    description: 'Pickup soccer every Sunday morning. All skill levels — just show up!',
    category: 'sports' as EventCategory,
    creator: 'u_seed6',
    location: { type: 'Point' as const, coordinates: [-121.755, 38.535] as [number, number] },
    address: 'Aggie Soccer Field, UC Davis',
    startTime: new Date(_t + 96 * 3600_000).toISOString(),
    endTime: new Date(_t + 98 * 3600_000).toISOString(),
    maxAttendees: 22,
    attendees: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    isPublic: true,
    status: 'active' as const,
    createdAt: new Date(_t).toISOString(),
    updatedAt: new Date(_t).toISOString(),
  },
];

const CATEGORIES: Array<{ label: string; value: EventCategory | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Sports', value: 'sports' },
  { label: 'Social', value: 'social' },
  { label: 'Hiking', value: 'hiking' },
  { label: 'Games', value: 'games' },
  { label: 'Other', value: 'other' },
];

const CATEGORY_COLORS: Record<EventCategory, string> = {
  sports: '#3b82f6',
  social: '#8b5cf6',
  hiking: '#10b981',
  games: '#f59e0b',
  other: '#6b7280',
};

export function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<EventCategory | 'all'>('all');
  const [events, setEvents] = useState<IEvent[]>(MOCK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { coords } = useLocation();

  const load = useCallback(async () => {
    try {
      const data = coords
        ? await getNearbyEvents({ lat: coords.latitude, lng: coords.longitude })
        : await getEvents(category !== 'all' ? { category } : undefined);
      // Only replace mock data if the server returned real events
      if (data.length > 0) setEvents(data);
    } catch {
      // Keep whatever is currently shown (mock data on first load, real data after)
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [coords, category]);

  useEffect(() => {
    load();
  }, [load]);

  const displayed = events.filter(e => {
    const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || e.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9333ea', '#ec4899', '#f97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Discover Events</Text>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textPlaceholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events…"
            placeholderTextColor={Colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat.value}
            onPress={() => setCategory(cat.value)}
            style={[styles.chip, category === cat.value && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} size="large" />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={e => e._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MapPin size={48} color={Colors.border} />
              <Text style={styles.emptyText}>No events found nearby.</Text>
              <Text style={styles.emptySubtext}>Try a different category or check back later.</Text>
            </View>
          }
          renderItem={({ item }) => <EventCard event={item} />}
        />
      )}
    </View>
  );
}

function EventCard({ event }: { event: IEvent }) {
  const startDate = format(parseISO(event.startTime), 'MMM d');
  const startTime = format(parseISO(event.startTime), 'h:mm a');
  const spotsLeft = event.maxAttendees - event.attendees.length;
  const isFull = spotsLeft <= 0;
  const categoryColor = CATEGORY_COLORS[event.category] ?? Colors.textSecondary;

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.cardTopRow}>
        <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}18` }]}>
          <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>{event.category}</Text>
        </View>
        {isFull && (
          <View style={styles.fullBadge}>
            <Text style={styles.fullBadgeText}>Full</Text>
          </View>
        )}
        {!event.isPublic && (
          <View style={styles.privateBadge}>
            <Text style={styles.privateBadgeText}>Private</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {event.title}
      </Text>

      <View style={styles.metaItem}>
        <MapPin size={13} color={Colors.primary} />
        <Text style={styles.metaText} numberOfLines={1}>
          {event.address}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Calendar size={13} color="#f97316" />
          <Text style={styles.metaText}>
            {startDate} · {startTime}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Users size={13} color={Colors.secondary} />
          <Text style={[styles.metaText, isFull && styles.metaTextFull]}>
            {event.attendees.length}/{event.maxAttendees}
          </Text>
        </View>
      </View>
    </Pressable>
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
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryBadgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  categoryBar: {
    backgroundColor: Colors.white,
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxHeight: 56,
  },
  categoryContent: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chip: {
    borderColor: Colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  chipTextActive: { color: Colors.white },
  container: { backgroundColor: Colors.backgroundMuted, flex: 1 },
  emptyState: { alignItems: 'center', gap: 8, paddingTop: 60 },
  emptySubtext: { color: Colors.textSecondary, fontSize: 14 },
  emptyText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  fullBadge: {
    backgroundColor: Colors.errorLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  fullBadgeText: { color: Colors.error, fontSize: 12, fontWeight: '600' },
  header: { paddingBottom: 20, paddingHorizontal: 20, paddingTop: 56 },
  headerTitle: { color: Colors.white, fontSize: 26, fontWeight: '700', marginBottom: 12 },
  list: { padding: 16, paddingBottom: 32 },
  loader: { flex: 1, marginTop: 60 },
  metaItem: { alignItems: 'center', flexDirection: 'row', flex: 1, gap: 5 },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  metaText: { color: Colors.textSecondary, flex: 1, fontSize: 13 },
  metaTextFull: { color: Colors.error },
  privateBadge: {
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  privateBadgeText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  searchBar: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { color: Colors.textPrimary, flex: 1, fontSize: 15 },
});

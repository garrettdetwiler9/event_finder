import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { MapPin, Search, Plus, Calendar, Users } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { getNearbyEvents, getEvents, type Event, type EventCategory } from '@/lib/api';
import { format } from 'date-fns';

const CATEGORIES: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'sports', label: 'Sports' },
  { value: 'social', label: 'Social' },
  { value: 'food', label: 'Food' },
  { value: 'music', label: 'Music' },
  { value: 'games', label: 'Games' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'leisure', label: 'Leisure' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_COLORS: Record<string, string> = {
  sports: '#3b82f6',
  social: '#ec4899',
  food: '#f97316',
  music: '#8b5cf6',
  games: '#10b981',
  hiking: '#84cc16',
  leisure: '#06b6d4',
  other: '#6b7280',
  all: Colors.brand,
};

export default function DiscoverScreen() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [category, setCategory] = useState<EventCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      let data: Event[];
      if (userLocation) {
        data = await getNearbyEvents(userLocation.lat, userLocation.lng, 10000, userProfile?._id);
      } else {
        data = await getEvents({ userId: userProfile?._id });
      }
      setEvents(data);
    } catch {
      setEvents([]);
    }
  }, [userLocation, userProfile]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    let result = events;
    if (category !== 'all') result = result.filter(e => e.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        e => e.title.toLowerCase().includes(q) || e.address.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [events, category, search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const getFriendsGoing = (event: Event) => {
    if (!userProfile) return [];
    const friendIds = (userProfile.friends as any[]).map((f: any) =>
      typeof f === 'string' ? f : f._id
    );
    return event.attendees.filter(a => friendIds.includes(a._id));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.brand} />
        <Text style={styles.loadingText}>Finding events near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hey {userProfile?.displayName?.split(' ')[0] ?? 'there'} 👋
          </Text>
          <Text style={styles.subtitle}>Discover events in Davis</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/create-event' as any)}>
          <Plus size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Search size={16} color={Colors.textPlaceholder} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          placeholderTextColor={Colors.textPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
        style={styles.pillsRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.pill, category === item.value && { backgroundColor: CATEGORY_COLORS[item.value] }]}
            onPress={() => setCategory(item.value)}
          >
            <Text style={[styles.pillText, category === item.value && { color: Colors.white, fontWeight: '600' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={e => e._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MapPin size={40} color={Colors.border} />
            <Text style={styles.emptyText}>No events found</Text>
            <Text style={styles.emptySubtext}>Try a different category or be the first to create one!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const attending = getFriendsGoing(item);
          const catColor = CATEGORY_COLORS[item.category] ?? Colors.brand;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/event/${item._id}` as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.categoryBar, { backgroundColor: catColor }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={[styles.catBadge, { backgroundColor: catColor + '20' }]}>
                    <Text style={[styles.catBadgeText, { color: catColor }]}>
                      {item.category.toUpperCase()}
                    </Text>
                  </View>
                  {item.ageMin ? (
                    <View style={styles.ageBadge}>
                      <Text style={styles.ageBadgeText}>{item.ageMin}+</Text>
                    </View>
                  ) : null}
                  {item.status === 'upcoming' && (
                    <View style={styles.upcomingBadge}>
                      <Text style={styles.upcomingText}>UPCOMING</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardMeta}>
                  <Calendar size={13} color={Colors.textSecondary} />
                  <Text style={styles.cardMetaText}>
                    {format(new Date(item.startTime), 'EEE, MMM d · h:mm a')}
                  </Text>
                </View>
                <View style={styles.cardMeta}>
                  <MapPin size={13} color={Colors.textSecondary} />
                  <Text style={styles.cardMetaText} numberOfLines={1}>{item.address}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.attendeeRow}>
                    <Users size={13} color={Colors.textSecondary} />
                    <Text style={styles.cardMetaText}>{item.attendees.length} going</Text>
                  </View>
                  {attending.length > 0 && (
                    <Text style={styles.friendsGoing}>
                      {attending.length} friend{attending.length > 1 ? 's' : ''} going
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { alignItems: 'center', backgroundColor: Colors.brand, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  ageBadge: { backgroundColor: '#fef3c7', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  ageBadgeText: { color: '#92400e', fontSize: 10, fontWeight: '700' },
  attendeeRow: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  card: { backgroundColor: Colors.white, borderRadius: 14, elevation: 2, flexDirection: 'row', marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cardMeta: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 4 },
  cardMetaText: { color: Colors.textSecondary, fontSize: 12 },
  cardTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 6 },
  cardTop: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  catBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  catBadgeText: { fontSize: 10, fontWeight: '700' },
  categoryBar: { width: 5 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  container: { backgroundColor: '#faf5ff', flex: 1 },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptySubtext: { color: Colors.textPlaceholder, fontSize: 14, marginTop: 6, textAlign: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600', marginTop: 12 },
  friendsGoing: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  greeting: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  loadingText: { color: Colors.textSecondary, fontSize: 14, marginTop: 12 },
  pill: { borderColor: Colors.border, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
  pillText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  pills: { gap: 8, paddingHorizontal: 16 },
  pillsRow: { maxHeight: 48, marginBottom: 12 },
  searchInput: { color: Colors.textPrimary, flex: 1, fontSize: 15, paddingHorizontal: 10 },
  searchRow: { alignItems: 'center', backgroundColor: Colors.white, borderColor: Colors.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 4, marginHorizontal: 16, marginBottom: 12, height: 44, paddingHorizontal: 12 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 2 },
  upcomingBadge: { backgroundColor: '#dbeafe', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  upcomingText: { color: '#1d4ed8', fontSize: 10, fontWeight: '700' },
});

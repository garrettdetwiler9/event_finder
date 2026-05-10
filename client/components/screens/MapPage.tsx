import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, RefreshCw } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import type { IEvent } from '@shared/types';
import { getNearbyEvents, getEvents } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';
import { Colors } from '@/constants/Colors';

const CATEGORY_COLORS: Record<string, string> = {
  sports: '#3b82f6',
  social: '#8b5cf6',
  hiking: '#10b981',
  games: '#f59e0b',
  other: '#6b7280',
};

const DEFAULT_REGION: Region = {
  latitude: 38.5449,
  longitude: -121.7405,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function MapPage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { coords, loading: locationLoading } = useLocation();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = coords
        ? await getNearbyEvents(coords.latitude, coords.longitude, 10000)
        : await getEvents();
      setEvents(data.filter(e => e.status === 'active'));
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    if (!locationLoading) load();
  }, [load, locationLoading]);

  const initialRegion: Region = coords
    ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : DEFAULT_REGION;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9333ea', '#ec4899', '#f97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Event Map</Text>
            <Text style={styles.headerSub}>
              {loading
                ? 'Loading…'
                : `${events.length} event${events.length !== 1 ? 's' : ''} nearby`}
            </Text>
          </View>
          <Pressable
            onPress={load}
            style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.7 }]}
          >
            <RefreshCw size={20} color={Colors.white} />
          </Pressable>
        </View>
      </LinearGradient>

      {loading && locationLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loaderText}>Finding events near you…</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {events.map(event => {
            const [lng, lat] = event.location.coordinates;
            const color = CATEGORY_COLORS[event.category] ?? Colors.primary;
            return (
              <Marker
                key={event._id}
                coordinate={{ latitude: lat, longitude: lng }}
                pinColor={color}
              >
                <Callout tooltip>
                  <View style={styles.callout}>
                    <View style={[styles.calloutAccent, { backgroundColor: color }]} />
                    <View style={styles.calloutBody}>
                      <Text style={styles.calloutTitle} numberOfLines={2}>
                        {event.title}
                      </Text>
                      <Text style={styles.calloutCategory}>{event.category}</Text>
                      <Text style={styles.calloutDate}>
                        {format(parseISO(event.startTime), 'MMM d · h:mm a')}
                      </Text>
                      <Text style={styles.calloutAddress} numberOfLines={1}>
                        {event.address}
                      </Text>
                      <Text style={styles.calloutAttendees}>
                        {event.attendees.length}/{event.maxAttendees} attending
                      </Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      )}

      {events.length === 0 && !loading && (
        <View style={styles.emptyOverlay}>
          <View style={styles.emptyCard}>
            <MapPin size={32} color={Colors.primary} />
            <Text style={styles.emptyTitle}>No events nearby</Text>
            <Text style={styles.emptyText}>Check back later or expand your search radius.</Text>
          </View>
        </View>
      )}

      <View style={styles.legend}>
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <View key={cat} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendLabel}>{cat}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  callout: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: 220,
  },
  calloutAccent: { height: 4 },
  calloutAddress: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  calloutAttendees: { color: Colors.primary, fontSize: 12, fontWeight: '600', marginTop: 6 },
  calloutBody: { padding: 12 },
  calloutCategory: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  calloutDate: { color: Colors.orange, fontSize: 12, marginTop: 4 },
  calloutTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  container: { flex: 1 },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    gap: 8,
    maxWidth: 280,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  emptyOverlay: {
    alignItems: 'center',
    bottom: 100,
    justifyContent: 'center',
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    top: 120,
  },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  emptyTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  header: { paddingBottom: 16, paddingHorizontal: 20, paddingTop: 56 },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerSub: { color: Colors.whiteAlpha80, fontSize: 13, marginTop: 2 },
  headerTitle: { color: Colors.white, fontSize: 26, fontWeight: '700' },
  legend: {
    backgroundColor: Colors.whiteAlpha95,
    borderRadius: 12,
    bottom: 24,
    elevation: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    left: 16,
    padding: 10,
    position: 'absolute',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  legendDot: { borderRadius: 5, height: 10, width: 10 },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  legendLabel: { color: Colors.textSecondary, fontSize: 11, textTransform: 'capitalize' },
  loaderContainer: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center' },
  loaderText: { color: Colors.textSecondary, fontSize: 15 },
  map: { flex: 1 },
  refreshBtn: {
    alignItems: 'center',
    backgroundColor: Colors.whiteAlpha20,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});

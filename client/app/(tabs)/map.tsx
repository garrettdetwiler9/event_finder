import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, type Region } from 'react-native-maps';
import { format } from 'date-fns';
import { getEvents, type Event } from '@/lib/api';
import { Colors } from '@/constants/Colors';

// Davis, CA
const DAVIS_REGION: Region = {
  latitude: 38.5449,
  longitude: -121.7405,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const CATEGORY_COLORS: Record<string, string> = {
  sports: '#9333ea',
  social: '#ec4899',
  hiking: '#16a34a',
  games: '#f97316',
  other: '#6b7280',
};

export default function MapScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Event | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getEvents();
      // only show events with valid coordinates
      setEvents(data.filter((e: Event) => e.location?.coordinates?.length === 2));
    } catch {
      // keep empty on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Event Map</Text>
        <Text style={styles.headerSub}>Davis, CA</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={DAVIS_REGION}
          showsUserLocation
          showsMyLocationButton
        >
          {events.map((event: Event) => {
            const [lng, lat] = event.location.coordinates;
            const color = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.other;
            return (
              <Marker
                key={event._id}
                coordinate={{ latitude: lat, longitude: lng }}
                pinColor={color}
                onPress={() => setSelected(event)}
              >
                <Callout tooltip={false}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{event.title}</Text>
                    <Text style={styles.calloutMeta}>
                      {format(new Date(event.startTime), 'MMM d, h:mm a')}
                    </Text>
                    <Text style={styles.calloutMeta}>
                      {(event.attendees as string[]).length}/{event.maxAttendees} attending
                    </Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <View key={cat} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{cat}</Text>
          </View>
        ))}
      </View>

      {selected && (
        <Pressable style={styles.dismiss} onPress={() => setSelected(null)}>
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  callout: { maxWidth: 180, padding: 4 },
  calloutMeta: { color: Colors.textSecondary, fontSize: 12 },
  calloutTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  container: { flex: 1 },
  dismiss: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    bottom: 90,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    width: 36,
  },
  dismissText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  legend: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    bottom: 90,
    elevation: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    left: 16,
    padding: 10,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  legendDot: { borderRadius: 5, height: 10, width: 10 },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  legendText: { color: Colors.textPrimary, fontSize: 11, textTransform: 'capitalize' },
  map: { flex: 1 },
});

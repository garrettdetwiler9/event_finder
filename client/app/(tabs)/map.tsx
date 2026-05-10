import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { getNearbyEvents, type Event } from '@/lib/api';
import { format } from 'date-fns';

const CATEGORY_COLORS: Record<string, string> = {
  sports: '#3b82f6', social: '#ec4899', food: '#f97316',
  music: '#8b5cf6', games: '#10b981', hiking: '#84cc16',
  leisure: '#06b6d4', other: '#6b7280',
};

const DAVIS_DEFAULT = { latitude: 38.5449, longitude: -121.7405 };

export default function MapScreen() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const loadEvents = useCallback(async (lat: number, lng: number) => {
    try {
      const data = await getNearbyEvents(lat, lng, 15000, userProfile?._id);
      setEvents(data);
    } catch {
      setEvents([]);
    }
  }, [userProfile]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setUserLocation(coords);
        await loadEvents(coords.latitude, coords.longitude);
      } else {
        setPermissionDenied(true);
        await loadEvents(DAVIS_DEFAULT.latitude, DAVIS_DEFAULT.longitude);
      }
      setLoading(false);
    })();
  }, [loadEvents]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.brand} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const region = userLocation
    ? { ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { ...DAVIS_DEFAULT, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <View style={styles.container}>
      {permissionDenied && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Location access denied — showing Davis, CA</Text>
        </View>
      )}
      <MapView style={styles.map} initialRegion={region} showsUserLocation={!permissionDenied}>
        {events.map(event => {
          const [lng, lat] = event.location.coordinates;
          const color = CATEGORY_COLORS[event.category] ?? Colors.brand;
          return (
            <Marker
              key={event._id}
              coordinate={{ latitude: lat, longitude: lng }}
              pinColor={color}
            >
              <Callout onPress={() => router.push(`/event/${event._id}` as any)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{event.title}</Text>
                  <Text style={styles.calloutMeta}>
                    {format(new Date(event.startTime), 'MMM d · h:mm a')}
                  </Text>
                  <Text style={styles.calloutMeta}>{event.attendees.length} going</Text>
                  <Text style={styles.calloutLink}>Tap to view →</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>{events.length} events nearby</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#fef3c7', paddingHorizontal: 16, paddingVertical: 8, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  bannerText: { color: '#92400e', fontSize: 12, textAlign: 'center' },
  callout: { maxWidth: 200, padding: 4 },
  calloutLink: { color: Colors.brand, fontSize: 12, fontWeight: '600', marginTop: 4 },
  calloutMeta: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  calloutTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  container: { flex: 1 },
  legend: { backgroundColor: Colors.white, borderRadius: 20, bottom: 100, elevation: 4, paddingHorizontal: 16, paddingVertical: 8, position: 'absolute', right: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  legendTitle: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  loadingText: { color: Colors.textSecondary, fontSize: 14, marginTop: 12 },
  map: { flex: 1 },
});

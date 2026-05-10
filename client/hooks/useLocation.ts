import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

interface Coords {
  latitude: number;
  longitude: number;
}

interface UseLocationResult {
  coords: Coords | null;
  loading: boolean;
  error: string | null;
}

export function useLocation(): UseLocationResult {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) {
          setError('Location permission denied');
          setLoading(false);
        }
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!cancelled) {
        setCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setLoading(false);
      }
    })().catch(err => {
      if (!cancelled) {
        setError(err.message ?? 'Failed to get location');
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { coords, loading, error };
}

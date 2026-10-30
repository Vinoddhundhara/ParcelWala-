import * as Location from 'expo-location';
import { Address } from '../../types';

export interface LocationResult {
  latitude: number;
  longitude: number;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isPermissionGranted: boolean;
  error?: string;
}

export const PRESET_HUBS: Record<string, { name: string; lat: number; lon: number; city: string; state: string; pin: string }> = {
  bengaluru_indiranagar: {
    name: '100ft Road, Indiranagar',
    lat: 12.9784,
    lon: 77.6408,
    city: 'Bengaluru',
    state: 'Karnataka',
    pin: '560038',
  },
  bengaluru_koramangala: {
    name: '80 Feet Road, 4th Block Koramangala',
    lat: 12.9352,
    lon: 77.6245,
    city: 'Bengaluru',
    state: 'Karnataka',
    pin: '560034',
  },
  bengaluru_whitefield: {
    name: 'ITPL Main Road, Whitefield',
    lat: 12.9853,
    lon: 77.7289,
    city: 'Bengaluru',
    state: 'Karnataka',
    pin: '560066',
  },
  mumbai_bandra: {
    name: 'Hill Road, Bandra West',
    lat: 19.0596,
    lon: 72.8295,
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400050',
  },
  delhi_cp: {
    name: 'Connaught Place Inner Circle',
    lat: 28.6315,
    lon: 77.2167,
    city: 'New Delhi',
    state: 'Delhi',
    pin: '110001',
  },
};

export class LocationService {
  async requestCurrentLocation(): Promise<LocationResult> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return {
          latitude: PRESET_HUBS.bengaluru_indiranagar.lat,
          longitude: PRESET_HUBS.bengaluru_indiranagar.lon,
          isPermissionGranted: false,
          error: 'Location permission was denied. You can manually enter or pick your address.',
        };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      try {
        const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverse && reverse.length > 0) {
          const first = reverse[0];
          const street = [first.name, first.street, first.subregion].filter(Boolean).join(', ');
          return {
            latitude,
            longitude,
            streetAddress: street || 'Current Location',
            city: first.city || 'Bengaluru',
            state: first.region || 'Karnataka',
            postalCode: first.postalCode || '560038',
            isPermissionGranted: true,
          };
        }
      } catch {
        // Reverse geocoding failed or offline
      }

      return {
        latitude,
        longitude,
        streetAddress: 'Current GPS Pin',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        isPermissionGranted: true,
      };
    } catch (err: unknown) {
      return {
        latitude: PRESET_HUBS.bengaluru_indiranagar.lat,
        longitude: PRESET_HUBS.bengaluru_indiranagar.lon,
        isPermissionGranted: false,
        error: (err as Error)?.message || 'Unable to fetch current location.',
      };
    }
  }
}

export const locationService = new LocationService();


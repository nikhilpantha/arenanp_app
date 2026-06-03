import * as Location from 'expo-location';

/** Joins address components into a readable line, de-duping adjacent repeats. */
export function formatAddress(parts: Location.LocationGeocodedAddress | undefined): string {
  if (!parts) return '';
  const line = [parts.name, parts.street, parts.city, parts.region, parts.country]
    .filter(Boolean)
    .filter((v, i, arr) => v !== arr[i - 1]);
  return Array.from(new Set(line)).join(', ');
}

/** Best-effort reverse geocode; returns '' if it fails. */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    return formatAddress(place);
  } catch {
    return '';
  }
}

/** Requests permission and returns the device's current coords, or null if denied/unavailable. */
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return null;
  }
}

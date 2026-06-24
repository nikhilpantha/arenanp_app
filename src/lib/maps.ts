import { Linking } from 'react-native';

/**
 * Open a coordinate in Google Maps — the installed app when present, otherwise the
 * browser. Uses Google's universal cross-platform URL so the destination pin shows the
 * same way on iOS and Android.
 */
export function openInMaps(latitude: number, longitude: number): void {
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  Linking.openURL(url).catch(() => undefined);
}

/**
 * Thin Google Places (classic web service) wrapper for venue location search.
 *
 * Uses the same key as expo-maps (`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`). The **Places API**
 * must be enabled on that key in Google Cloud (billable). If it's missing or disabled,
 * the calls fail gracefully (empty results / null) and the map pin-drop still works.
 *
 * TODO(backend): proxy these through the server so the key isn't shipped to the client.
 */
const KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const BASE = 'https://maps.googleapis.com/maps/api/place';

// Dev fallback: with no key (or a key whose APIs aren't enabled) the live calls fail, so
// in development we serve a small canned list of Nepal venues. This makes the location
// flow fully testable in Expo Go without enabling the billable Google APIs. Real results
// always take precedence once the APIs are live.
const useMock = __DEV__;

interface MockPlace extends PlaceDetails {
  placeId: string;
  primary: string;
  secondary: string;
}

const MOCK_PLACES: MockPlace[] = [
  { placeId: 'mock:0', primary: 'Pulchowk Futsal', secondary: 'Pulchowk, Lalitpur', latitude: 27.6789, longitude: 85.317, address: 'Pulchowk, Lalitpur 44700, Nepal' },
  { placeId: 'mock:1', primary: 'Bhrikutimandap Ground', secondary: 'Kathmandu', latitude: 27.7006, longitude: 85.3206, address: 'Bhrikutimandap, Kathmandu 44600, Nepal' },
  { placeId: 'mock:2', primary: 'Thamel', secondary: 'Kathmandu', latitude: 27.7154, longitude: 85.3123, address: 'Thamel, Kathmandu 44600, Nepal' },
  { placeId: 'mock:3', primary: 'Bhaktapur Durbar Square', secondary: 'Bhaktapur', latitude: 27.6722, longitude: 85.4298, address: 'Durbar Square, Bhaktapur 44800, Nepal' },
  { placeId: 'mock:4', primary: 'Pokhara Lakeside', secondary: 'Pokhara, Gandaki', latitude: 28.2096, longitude: 83.9586, address: 'Lakeside, Pokhara 33700, Nepal' },
  { placeId: 'mock:5', primary: 'Siddhartha Highway', secondary: 'Butwal, Lumbini', latitude: 27.7006, longitude: 83.4486, address: 'Siddhartha Highway, Butwal, Lumbini, Nepal' },
  { placeId: 'mock:6', primary: 'Bharatpur', secondary: 'Chitwan', latitude: 27.6766, longitude: 84.435, address: 'Bharatpur, Chitwan 44200, Nepal' },
  { placeId: 'mock:7', primary: 'Dharan Clock Tower', secondary: 'Dharan, Sunsari', latitude: 26.8147, longitude: 87.279, address: 'Clock Tower, Dharan, Sunsari, Nepal' },
];

function mockSearch(query: string): PlacePrediction[] {
  const q = query.trim().toLowerCase();
  const matches = MOCK_PLACES.filter((p) => `${p.primary} ${p.secondary}`.toLowerCase().includes(q));
  return (matches.length ? matches : MOCK_PLACES).map(({ placeId, primary, secondary }) => ({
    placeId,
    primary,
    secondary,
  }));
}

export const placesConfigured = Boolean(KEY) || useMock;

/**
 * Google Static Maps image URL for a point with a marker — used to show the selected
 * location where the interactive native map isn't available (e.g. Expo Go). Returns null
 * if no key. Requires the **Maps Static API** enabled on the key.
 */
export function staticMapUrl(
  latitude: number,
  longitude: number,
  opts?: { width?: number; height?: number; zoom?: number },
): string | null {
  if (!KEY) return null;
  const { width = 640, height = 360, zoom = 15 } = opts ?? {};
  const center = `${latitude},${longitude}`;
  const params = new URLSearchParams({
    center,
    zoom: String(zoom),
    size: `${width}x${height}`,
    scale: '2',
    markers: `color:0xF59E0B|${center}`,
    key: KEY,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

export interface PlacePrediction {
  placeId: string;
  primary: string;
  secondary: string;
}

export interface PlaceDetails {
  latitude: number;
  longitude: number;
  address: string;
}

/** Autocomplete predictions for a query (restricted to Nepal). Falls back to the dev mock. */
export async function searchPlaces(query: string, sessionToken?: string): Promise<PlacePrediction[]> {
  if (query.trim().length < 3) return [];
  if (KEY) {
    try {
      const params = new URLSearchParams({ input: query, key: KEY, components: 'country:np' });
      if (sessionToken) params.set('sessiontoken', sessionToken);
      const res = await fetch(`${BASE}/autocomplete/json?${params.toString()}`);
      const json = await res.json();
      if (json.status === 'OK') {
        return (json.predictions ?? []).map(
          (p: {
            place_id: string;
            description: string;
            structured_formatting?: { main_text?: string; secondary_text?: string };
          }) => ({
            placeId: p.place_id,
            primary: p.structured_formatting?.main_text ?? p.description,
            secondary: p.structured_formatting?.secondary_text ?? '',
          }),
        );
      }
    } catch {
      // fall through to mock
    }
  }
  return useMock ? mockSearch(query) : [];
}

/** Resolves a prediction to coordinates + a formatted address. Falls back to the dev mock. */
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string,
): Promise<PlaceDetails | null> {
  // Mock predictions carry a `mock:` id; resolve them locally.
  if (placeId.startsWith('mock:')) {
    const m = MOCK_PLACES.find((p) => p.placeId === placeId);
    return m ? { latitude: m.latitude, longitude: m.longitude, address: m.address } : null;
  }
  if (!KEY) return null;
  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key: KEY,
      fields: 'geometry,formatted_address',
    });
    if (sessionToken) params.set('sessiontoken', sessionToken);
    const res = await fetch(`${BASE}/details/json?${params.toString()}`);
    const json = await res.json();
    const loc = json.result?.geometry?.location;
    if (json.status !== 'OK' || !loc) return null;
    return { latitude: loc.lat, longitude: loc.lng, address: json.result.formatted_address ?? '' };
  } catch {
    return null;
  }
}

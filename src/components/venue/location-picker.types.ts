export interface PickedLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  /** Currently selected address (e.g. from Google Places), for display/refinement. */
  address?: string;
  onChange: (loc: PickedLocation) => void;
}

// Kathmandu — sensible default before the user moves the map or shares their location.
export const DEFAULT_REGION = { latitude: 27.7172, longitude: 85.324 };
export const DEFAULT_ZOOM = 14;

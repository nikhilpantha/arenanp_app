import type { ConfigContext, ExpoConfig } from 'expo/config';

// Extends the static app.json with values that must come from the environment
// (the Google Maps Android API key), so the secret stays out of source control.
// expo-maps reads the Android key from `android.config.googleMaps.apiKey`; iOS uses Apple Maps.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
});

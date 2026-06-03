import type { UseFormReturn } from 'react-hook-form';
import { View } from 'react-native';

import { Icon, Typography } from '@/components/common';
import type { PickedLocation } from '@/components/venue/location-picker.types';
import { LocationPicker, mapsAvailable } from '@/components/venue/LocationPicker';
import { PlacesSearch } from '@/components/venue/PlacesSearch';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';

import type { VenueFormValues } from './form';

export function StepLocation({ form }: { form: UseFormReturn<VenueFormValues> }) {
  const theme = useTheme();
  const { accent } = useAccent();
  const address = form.watch('address');
  const latitude = form.watch('latitude');
  const longitude = form.watch('longitude');
  const error = form.formState.errors.address?.message;
  const selected = Boolean(address && latitude != null && longitude != null);

  const apply = ({ latitude: lat, longitude: lng, address: addr }: PickedLocation) => {
    form.setValue('latitude', lat, { shouldValidate: true });
    form.setValue('longitude', lng, { shouldValidate: true });
    form.setValue('address', addr, { shouldValidate: true });
  };

  // Editing the search text away from a pick clears the selection (map hides, prompt returns).
  const clear = () => form.setValue('address', '', { shouldValidate: true });

  return (
    <View className="flex-1 gap-md">
      <PlacesSearch value={address} onSelect={apply} onClear={clear} />

      {/* Map shows once a location is picked — or always on a dev build, where the user
          can self-position by dragging. In Expo Go with nothing picked, prompt instead. */}
      {selected || mapsAvailable ? (
        <View className="flex-1">
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            address={address}
            onChange={apply}
          />
        </View>
      ) : (
        <View
          className="flex-1 items-center justify-center gap-sm rounded-3xl border-2 border-dashed p-lg"
          style={{ minHeight: 200, borderColor: accent, backgroundColor: `${accent}0D` }}>
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accent}1A` }}>
            <Icon name="mapPin" size={26} color={accent} />
          </View>
          <Typography variant="label-lg" color={accent}>
            Add your venue location
          </Typography>
          <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
            Search above to place it on the map.
          </Typography>
        </View>
      )}

      {error && !selected ? (
        <Typography variant="label-sm" color={theme.danger} style={{ textTransform: 'none' }}>
          {error}
        </Typography>
      ) : null}
    </View>
  );
}

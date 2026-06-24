import { View } from 'react-native';

import { Typography } from '@/components/common';
import { amenityIcon } from '@/lib/amenity-icon';

import { FeatureGrid } from './FeatureGrid';

/** Amenities as a hotel-style icon grid. Hidden when there are none. */
export function VenueAmenities({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;

  return (
    <View className="gap-sm">
      <Typography variant="label-lg">Amenities</Typography>
      <FeatureGrid items={amenities.map((a) => ({ icon: amenityIcon(a, 'check'), label: a }))} />
    </View>
  );
}

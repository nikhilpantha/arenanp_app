import { View } from 'react-native';

import { Typography } from '@/components/common';
import { amenityIcon } from '@/lib/amenity-icon';

import { FeatureGrid } from './FeatureGrid';

/** The venue's add-on services as a hotel-style icon grid (price as the sub-label). */
export function VenueServices({ services }: { services: { name: string; price?: number }[] }) {
  if (services.length === 0) return null;

  return (
    <View className="gap-sm">
      <Typography variant="label-lg">Add-on services</Typography>
      <FeatureGrid
        items={services.map((s) => ({
          icon: amenityIcon(s.name, 'package'),
          label: s.name,
          sublabel: s.price != null ? `Rs ${s.price}` : 'Free',
        }))}
      />
    </View>
  );
}

import type { UseFormReturn } from 'react-hook-form';
import { View } from 'react-native';

import { Typography } from '@/components/common';
import { FormInput, FormPhoneInput, FormTimeSelect } from '@/components/form';

import type { VenueFormValues } from './form';

export function StepVenueBasics({ form }: { form: UseFormReturn<VenueFormValues> }) {
  return (
    <View className="gap-md">
      <FormInput
        control={form.control}
        name="venueName"
        label="Venue name"
        placeholder="e.g. Arena Futsal"
        leftIcon="building"
        autoCapitalize="words"
      />
      <FormPhoneInput control={form.control} name="venuePhone" label="Venue contact number" />
      <FormPhoneInput
        control={form.control}
        name="contactPhone"
        label="Alternate contact (optional)"
      />

      <View className="gap-sm pt-sm">
        <Typography variant="label-lg">Operating hours</Typography>
        <View className="flex-row gap-md">
          <FormTimeSelect control={form.control} name="openTime" label="Opens" />
          <FormTimeSelect control={form.control} name="closeTime" label="Closes" />
        </View>
      </View>
    </View>
  );
}

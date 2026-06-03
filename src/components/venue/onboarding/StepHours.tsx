import type { UseFormReturn } from 'react-hook-form';
import { View } from 'react-native';

import { Typography } from '@/components/common';
import { FormTimeSelect } from '@/components/form';
import { useTheme } from '@/hooks/use-theme';

import type { VenueFormValues } from './form';

export function StepHours({ form }: { form: UseFormReturn<VenueFormValues> }) {
  const theme = useTheme();

  return (
    <View className="gap-sm">
      <Typography variant="label-lg">Operating hours</Typography>
      <Typography variant="body-md" color={theme.inkMuted}>
        When players can book slots at your venue.
      </Typography>
      <View className="flex-row gap-md pt-sm">
        <FormTimeSelect control={form.control} name="openTime" label="Opens" />
        <FormTimeSelect control={form.control} name="closeTime" label="Closes" />
      </View>
    </View>
  );
}

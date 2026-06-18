import type { UseFormReturn } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { Icon, Input, Typography } from '@/components/common';
import { FormTimeSelect } from '@/components/form';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';

import type { VenueFormValues } from './form';

const toAmount = (text: string): number | undefined => {
  const digits = text.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : undefined;
};

export function StepHours({ form }: { form: UseFormReturn<VenueFormValues> }) {
  const theme = useTheme();
  const { accent } = useAccent();

  const additional = form.watch('additionalServices') ?? [];
  const setAdditional = (next: typeof additional) =>
    form.setValue('additionalServices', next, { shouldValidate: true });

  return (
    <View className="gap-lg">
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

      <View className="gap-sm">
        <Typography variant="label-lg">Additional services (optional)</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          Extras like bib rental, showers or parking. Leave price empty if it&apos;s free.
        </Typography>
        {additional.map((row, idx) => (
          <View key={idx} className="flex-row items-center gap-sm">
            <View className="flex-1">
              <Input
                placeholder="Service name"
                value={row.name}
                onChangeText={(t) =>
                  setAdditional(additional.map((r, i) => (i === idx ? { ...r, name: t } : r)))
                }
              />
            </View>
            <View style={{ width: 120 }}>
              <Input
                placeholder="Rs (free)"
                keyboardType="number-pad"
                value={row.price != null ? String(row.price) : ''}
                onChangeText={(t) =>
                  setAdditional(
                    additional.map((r, i) => (i === idx ? { ...r, price: toAmount(t) } : r)),
                  )
                }
              />
            </View>
            <Pressable
              onPress={() => setAdditional(additional.filter((_, i) => i !== idx))}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Remove service"
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.cardMuted }}>
              <Icon name="x" size={16} color={theme.inkMuted} />
            </Pressable>
          </View>
        ))}
        <Pressable
          onPress={() => setAdditional([...additional, { name: '', price: undefined }])}
          className="flex-row items-center gap-xs self-start pt-xs">
          <Icon name="plus" size={18} color={accent} />
          <Typography variant="label-lg" color={accent}>
            Add service
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

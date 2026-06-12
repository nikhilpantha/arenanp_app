import type { UseFormReturn } from 'react-hook-form';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Card, Icon, Input, NumberStepper, SportGlyph, Typography } from '@/components/common';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';
import { useSports } from '@/lib/api/sports';
import type { SportType } from '@/types';

import type { VenueFormValues } from './form';

type Service = NonNullable<VenueFormValues['services']>[number];

const SLOT_OPTIONS = [30, 60, 90, 120] as const;

const toAmount = (text: string): number | undefined => {
  const digits = text.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : undefined;
};

export function StepServicesPricing({ form }: { form: UseFormReturn<VenueFormValues> }) {
  const theme = useTheme();
  const { accent } = useAccent();
  const { data: sports, isLoading } = useSports();
  const services = (form.watch('services') ?? []) as Service[];
  const additional = form.watch('additionalServices') ?? [];
  const error = form.formState.errors.services?.message;

  const setServices = (next: Service[]) =>
    form.setValue('services', next, { shouldValidate: true });
  const setAdditional = (next: typeof additional) =>
    form.setValue('additionalServices', next, { shouldValidate: true });

  const toggleSport = (sport: SportType) => {
    const exists = services.some((s) => s.sport === sport);
    if (exists) setServices(services.filter((s) => s.sport !== sport));
    else
      setServices([
        ...services,
        { sport, features: [], courts: 1, slotMinutes: 60, pricePerSlot: undefined },
      ]);
  };

  const patch = (sport: SportType, p: Partial<Service>) =>
    setServices(services.map((s) => (s.sport === sport ? { ...s, ...p } : s)));

  const toggleFeature = (svc: Service, id: string) => {
    const feats = svc.features ?? [];
    patch(svc.sport, { features: feats.includes(id) ? feats.filter((f) => f !== id) : [...feats, id] });
  };

  return (
    <View className="gap-lg">
      <View className="gap-sm">
        <Typography variant="label-lg">Sports you offer</Typography>
        {isLoading && !sports ? (
          <View className="items-center py-lg">
            <ActivityIndicator color={accent} />
          </View>
        ) : (sports?.length ?? 0) === 0 ? (
          <Typography variant="body-md" color={theme.inkMuted}>
            No sports are available yet — an admin needs to add them first.
          </Typography>
        ) : (
          sports?.map((sport) => {
            const svc = services.find((s) => s.sport === sport.slug);
            const active = Boolean(svc);
            return (
              <Card
                key={sport.slug}
                variant={active ? 'default' : 'muted'}
                elevation={active ? 'sm' : 'none'}
                className="gap-md">
                <Pressable
                  onPress={() => toggleSport(sport.slug)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className="flex-row items-center gap-sm">
                  <SportGlyph slug={sport.slug} size={28} />
                  <View className="flex-1">
                    <Typography variant="label-lg">{sport.name}</Typography>
                    {sport.description ? (
                      <Typography variant="body-md" color={theme.inkMuted}>
                        {sport.description}
                      </Typography>
                    ) : null}
                  </View>
                  <View
                    className="h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: active ? accent : theme.cardSunken }}>
                    {active ? <Icon name="check" size={15} color="#ffffff" /> : null}
                  </View>
                </Pressable>

                {active && svc ? (
                  <View className="gap-md border-t pt-md" style={{ borderColor: theme.border }}>
                    {sport.features.length > 0 ? (
                      <View className="flex-row flex-wrap gap-xs">
                        {sport.features.map((f) => {
                          const on = (svc.features ?? []).includes(f);
                          return (
                            <Pressable
                              key={f}
                              onPress={() => toggleFeature(svc, f)}
                              className="rounded-full border px-md py-[6px]"
                              style={{
                                borderColor: on ? accent : theme.border,
                                backgroundColor: on ? `${accent}14` : 'transparent',
                              }}>
                              <Typography variant="label-md" color={on ? accent : theme.inkMuted}>
                                {f}
                              </Typography>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}

                    <View className="flex-row items-center justify-between">
                      <Typography variant="label-lg">Courts</Typography>
                      <NumberStepper
                        value={svc.courts}
                        onChange={(v) => patch(sport.slug, { courts: v })}
                      />
                    </View>

                    <View className="gap-sm">
                      <Typography variant="label-lg">Slot duration</Typography>
                      <View className="flex-row flex-wrap gap-sm">
                        {SLOT_OPTIONS.map((m) => {
                          const on = svc.slotMinutes === m;
                          return (
                            <Pressable
                              key={m}
                              onPress={() => patch(sport.slug, { slotMinutes: m })}
                              className="rounded-full border px-md py-sm"
                              style={{
                                borderColor: on ? accent : theme.border,
                                backgroundColor: on ? `${accent}14` : 'transparent',
                              }}>
                              <Typography variant="label-md" color={on ? accent : theme.inkMuted}>
                                {m} min
                              </Typography>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <Input
                      label="Price per slot (Rs)"
                      keyboardType="number-pad"
                      leftIcon="dollarSign"
                      placeholder="e.g. 1200"
                      value={svc.pricePerSlot != null ? String(svc.pricePerSlot) : ''}
                      onChangeText={(t) => patch(sport.slug, { pricePerSlot: toAmount(t) })}
                    />
                  </View>
                ) : null}
              </Card>
            );
          })
        )}
        {error ? (
          <Typography variant="label-sm" color={theme.danger} style={{ textTransform: 'none' }}>
            {error}
          </Typography>
        ) : null}
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

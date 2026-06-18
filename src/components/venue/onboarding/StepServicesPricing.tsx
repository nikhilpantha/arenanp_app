import type { UseFormReturn } from 'react-hook-form';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Card, Icon, Input, SportGlyph, Typography } from '@/components/common';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';
import { useSports } from '@/lib/api/sports';
import type { SportType } from '@/types';

import type { VenueFormValues } from './form';

type Service = NonNullable<VenueFormValues['services']>[number];
type Court = NonNullable<Service['courts']>[number];

/** Fallback slot options if a sport somehow has none configured (backend guarantees ≥1). */
const FALLBACK_SLOTS = [30, 60, 90, 120];

/** The slot length to pre-select when a court is created — prefer 60, else the shortest. */
const defaultSlot = (durations: number[]): number =>
  durations.includes(60) ? 60 : (durations[0] ?? 60);

const makeCourt = (slotMinutes: number, pricePerSlot?: number): Court => ({
  slotMinutes,
  pricePerSlot,
});

const toAmount = (text: string): number | undefined => {
  const digits = text.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : undefined;
};

export function StepServicesPricing({ form }: { form: UseFormReturn<VenueFormValues> }) {
  const theme = useTheme();
  const { accent } = useAccent();
  const { data: sports, isLoading } = useSports();
  const services = (form.watch('services') ?? []) as Service[];
  const error = form.formState.errors.services?.message;

  const setServices = (next: Service[]) => {
    form.setValue('services', next, { shouldValidate: false });
    // Re-validate live only once errors are already showing (i.e. after a Continue attempt),
    // so we never surface errors before the owner tries to proceed.
    if (form.formState.errors.services) form.trigger('services');
  };

  const toggleSport = (sport: SportType, slotMinutes: number) => {
    const exists = services.some((s) => s.sport === sport);
    if (exists) setServices(services.filter((s) => s.sport !== sport));
    else setServices([...services, { sport, features: [], courts: [makeCourt(slotMinutes)] }]);
  };

  const patch = (sport: SportType, p: Partial<Service>) =>
    setServices(services.map((s) => (s.sport === sport ? { ...s, ...p } : s)));

  const toggleFeature = (svc: Service, id: string) => {
    const feats = svc.features ?? [];
    patch(svc.sport, { features: feats.includes(id) ? feats.filter((f) => f !== id) : [...feats, id] });
  };

  // Court list helpers — operate on one sport's courts array.
  const updateCourts = (sport: SportType, fn: (courts: Court[]) => Court[]) => {
    const svc = services.find((s) => s.sport === sport);
    if (svc) patch(sport, { courts: fn(svc.courts ?? []) });
  };

  // New court inherits the previous court's slot + price (fast for identical courts), and
  // multi-court rows are pre-named "<Sport> 1", "<Sport> 2"… so owners rarely need to type.
  // Any name the owner already set is preserved.
  const addCourt = (sport: SportType, sportName: string, fallbackSlot: number) =>
    updateCourts(sport, (courts) => {
      const last = courts[courts.length - 1];
      const next = [...courts, makeCourt(last?.slotMinutes ?? fallbackSlot, last?.pricePerSlot)];
      return next.map((c, i) => ({
        ...c,
        name: c.name?.trim() ? c.name : `${sportName} ${i + 1}`,
      }));
    });

  const removeCourt = (sport: SportType, index: number) =>
    updateCourts(sport, (courts) => courts.filter((_, i) => i !== index));

  const patchCourt = (sport: SportType, index: number, p: Partial<Court>) =>
    updateCourts(sport, (courts) => courts.map((c, i) => (i === index ? { ...c, ...p } : c)));

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
                variant="default"
                elevation={active ? 'md' : 'sm'}
                className="gap-md">
                <Pressable
                  onPress={() => toggleSport(sport.slug, defaultSlot(sport.slotDurations))}
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

                    {(() => {
                      const courts = svc.courts ?? [];
                      const multi = courts.length > 1;
                      const slotOptions = sport.slotDurations.length
                        ? sport.slotDurations
                        : FALLBACK_SLOTS;
                      // Nested per-court validation errors live under the service's index
                      // in the services array (not the sports-catalogue order).
                      const svcIndex = services.findIndex((s) => s.sport === sport.slug);
                      const courtErrors = (
                        form.formState.errors.services as
                          | { courts?: { pricePerSlot?: { message?: string } }[] }[]
                          | undefined
                      )?.[svcIndex]?.courts;
                      return (
                        <View className="gap-md">
                          {courts.map((court, ci) => (
                            <View
                              key={ci}
                              className={multi ? 'gap-sm rounded-2xl border p-md' : 'gap-sm'}
                              style={multi ? { borderColor: theme.border } : undefined}>
                              {multi ? (
                                <View className="flex-row items-center justify-between">
                                  <Typography variant="label-md" color={theme.inkMuted}>
                                    {`Court ${ci + 1}`}
                                  </Typography>
                                  <Pressable
                                    onPress={() => removeCourt(sport.slug, ci)}
                                    hitSlop={6}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Remove court ${ci + 1}`}
                                    className="h-7 w-7 items-center justify-center rounded-full"
                                    style={{ backgroundColor: theme.cardMuted }}>
                                    <Icon name="x" size={14} color={theme.inkMuted} />
                                  </Pressable>
                                </View>
                              ) : null}

                              {multi ? (
                                <Input
                                  placeholder={`${sport.name} ${ci + 1}`}
                                  value={court.name ?? ''}
                                  onChangeText={(t) => patchCourt(sport.slug, ci, { name: t })}
                                />
                              ) : null}

                              <View className="gap-sm">
                                <Typography variant="label-md" color={theme.inkMuted}>
                                  Slot duration
                                </Typography>
                                <View className="flex-row flex-wrap gap-sm">
                                  {slotOptions.map((m) => {
                                    const on = court.slotMinutes === m;
                                    return (
                                      <Pressable
                                        key={m}
                                        onPress={() => patchCourt(sport.slug, ci, { slotMinutes: m })}
                                        className="rounded-full border px-md py-sm"
                                        style={{
                                          borderColor: on ? accent : theme.border,
                                          backgroundColor: on ? `${accent}14` : 'transparent',
                                        }}>
                                        <Typography
                                          variant="label-md"
                                          color={on ? accent : theme.inkMuted}>
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
                                value={court.pricePerSlot != null ? String(court.pricePerSlot) : ''}
                                onChangeText={(t) =>
                                  patchCourt(sport.slug, ci, { pricePerSlot: toAmount(t) })
                                }
                                error={courtErrors?.[ci]?.pricePerSlot?.message}
                              />
                            </View>
                          ))}

                          <Pressable
                            onPress={() =>
                              addCourt(sport.slug, sport.name, defaultSlot(sport.slotDurations))
                            }
                            accessibilityRole="button"
                            accessibilityLabel="Add court"
                            className="flex-row items-center gap-xs self-start">
                            <Icon name="plus" size={18} color={accent} />
                            <Typography variant="label-md" color={accent}>
                              Add court
                            </Typography>
                          </Pressable>
                        </View>
                      );
                    })()}
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
    </View>
  );
}

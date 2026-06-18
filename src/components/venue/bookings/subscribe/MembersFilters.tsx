import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon, SearchBar, Typography } from '@/components/common';
import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { type ChipOption, MembersFilterSheet } from './MembersFilterSheet';

/**
 * The Members screen header: a search field, a single "Filters" trigger, and a row of
 * removable chips for whatever's active. All status/plan selection happens in the sheet
 * ({@link MembersFilterSheet}) so the two filter dimensions never read as competing tab rows.
 */
export function MembersFilters<S extends string, P extends string>({
  query,
  onQueryChange,
  statusOptions,
  status,
  onStatusChange,
  planOptions,
  planId,
  onPlanChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  /** First option is the "all" reset value for status. */
  statusOptions: readonly ChipOption<S>[];
  status: S;
  onStatusChange: (value: S) => void;
  /** First option is the "all" reset value for plan. */
  planOptions: readonly ChipOption<P>[];
  planId: P;
  onPlanChange: (value: P) => void;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const allStatus = statusOptions[0].value;
  const allPlan = planOptions[0].value;
  const active: { key: string; label: string; onRemove: () => void }[] = [];
  if (status !== allStatus) {
    const label = statusOptions.find((o) => o.value === status)?.label;
    if (label) active.push({ key: 'status', label, onRemove: () => onStatusChange(allStatus) });
  }
  if (planId !== allPlan) {
    const label = planOptions.find((o) => o.value === planId)?.label;
    if (label) active.push({ key: 'plan', label, onRemove: () => onPlanChange(allPlan) });
  }

  return (
    <View className="gap-md">
      <View className="flex-row items-center gap-sm">
        <View className="flex-1">
          <SearchBar
            value={query}
            onChangeText={onQueryChange}
            onClear={() => onQueryChange('')}
            placeholder="Search members by name or phone"
          />
        </View>
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Filters"
          className="h-11 flex-row items-center gap-xs rounded-full px-md"
          style={[
            {
              backgroundColor: active.length ? theme.primary : theme.card,
              borderWidth: 1,
              borderColor: active.length ? theme.primary : theme.border,
            },
            active.length ? null : Shadow.sm,
          ]}>
          <Icon name="filter" size={16} color={active.length ? '#ffffff' : theme.ink} />
          <Typography
            variant="label-sm"
            color={active.length ? '#ffffff' : theme.ink}
            style={{ textTransform: 'none' }}>
            {active.length ? `Filters · ${active.length}` : 'Filters'}
          </Typography>
        </Pressable>
      </View>

      {active.length ? (
        <View className="flex-row flex-wrap gap-sm">
          {active.map((a) => (
            <Pressable
              key={a.key}
              onPress={a.onRemove}
              className="flex-row items-center gap-xs rounded-full px-md py-xs"
              style={{ backgroundColor: theme.cardMuted }}>
              <Typography variant="label-sm" style={{ textTransform: 'none' }}>
                {a.label}
              </Typography>
              <Icon name="x" size={13} color={theme.inkMuted} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <MembersFilterSheet
        visible={open}
        onClose={() => setOpen(false)}
        onReset={() => {
          onStatusChange(allStatus);
          onPlanChange(allPlan);
        }}
        statusOptions={statusOptions}
        status={status}
        onStatusChange={onStatusChange}
        planOptions={planOptions}
        planId={planId}
        onPlanChange={onPlanChange}
      />
    </View>
  );
}

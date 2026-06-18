import { Button, Card, Icon, type IconName, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

/** Empty placeholder shown when a booking list (today / upcoming) has no items. */
export function BookingsEmptyState({
  label,
  hint,
  icon = 'calendarDays',
  actionLabel,
  onAction,
}: {
  label: string;
  hint: string;
  icon?: IconName;
  /** Optional CTA shown below the hint (e.g. "Create a plan"). */
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  return (
    <Card elevation="md" className="items-center gap-sm py-xl">
      <Icon name={icon} size={28} color={theme.primary} />
      <Typography variant="label-lg">{label}</Typography>
      <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
        {hint}
      </Typography>
      {actionLabel && onAction ? (
        <Button size="md" leftIcon="plus" className="mt-sm rounded-full" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}

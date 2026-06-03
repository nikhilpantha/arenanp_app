import { Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

/** Empty placeholder shown when a booking list (today / upcoming) has no items. */
export function BookingsEmptyState({ label, hint }: { label: string; hint: string }) {
  const theme = useTheme();
  return (
    <Card elevation="md" className="items-center gap-sm py-xl">
      <Icon name="calendarDays" size={28} color={theme.primary} />
      <Typography variant="label-lg">{label}</Typography>
      <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
        {hint}
      </Typography>
    </Card>
  );
}

import type { IconName } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { SlotStatus } from '@/types';

export interface SlotStatusMeta {
  label: string;
  color: string;
  icon: IconName;
}

/** Color + icon + short word for every slot status (color-coded, never color alone). */
export function useSlotStatusMeta(): Record<SlotStatus, SlotStatusMeta> {
  const theme = useTheme();
  return {
    available: { label: 'Available', color: theme.primary, icon: 'check' },
    online: { label: 'Online', color: '#2563eb', icon: 'calendarDays' },
    walkin: { label: 'Walk-in', color: theme.secondaryDark, icon: 'user' },
    subscription: { label: 'Member', color: '#7c3aed', icon: 'award' },
    maintenance: { label: 'Blocked', color: theme.inkMuted, icon: 'ban' },
  };
}

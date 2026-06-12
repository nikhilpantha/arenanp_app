import { View } from 'react-native';

import { Card, Icon, type IconName, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { Panel } from '@/types';

interface RoleOption {
  role: Panel;
  title: string;
  subtitle: string;
  icon: IconName;
}

export interface RoleSelectProps {
  value: Panel | null;
  onChange: (role: Panel) => void;
}

const ROLES: RoleOption[] = [
  { role: 'player', title: 'Player', subtitle: 'Book & play sports', icon: 'trophy' },
  { role: 'venue', title: 'Venue', subtitle: 'Manage your venue', icon: 'building' },
];

/** Premium two-card role picker (controlled). The caller owns the Continue CTA. */
export function RoleSelect({ value, onChange }: RoleSelectProps) {
  const theme = useTheme();
  // Single green brand accent; the two roles are distinguished by icon + label, not color.
  const accent = theme.primary;

  return (
    <View className="gap-md">
      {ROLES.map((item) => {
        const active = value === item.role;
        return (
          <Card
            key={item.role}
            elevation={active ? 'md' : 'sm'}
            onPress={() => onChange(item.role)}
            style={active ? { borderWidth: 1.5, borderColor: accent } : undefined}
            className="flex-row items-center gap-md">
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${accent}1A` }}>
              <Icon name={item.icon} size={26} color={accent} />
            </View>
            <View className="flex-1 gap-[2px]">
              <Typography variant="headline-md">{item.title}</Typography>
              <Typography variant="body-md" color={theme.inkMuted}>
                {item.subtitle}
              </Typography>
            </View>
            <View
              className="h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: active ? accent : theme.cardSunken }}>
              {active && <Icon name="check" size={15} color="#ffffff" />}
            </View>
          </Card>
        );
      })}
    </View>
  );
}

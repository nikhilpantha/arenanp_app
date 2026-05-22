import { type ComponentProps } from 'react';
import { type ColorValue } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@/hooks/use-theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue;
  testID?: string;
}

export function Icon({ name, size = 24, color, testID }: IconProps) {
  const theme = useTheme();
  return <Ionicons name={name} size={size} color={color ?? theme.ink} testID={testID} />;
}

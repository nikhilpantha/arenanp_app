import {
  type GestureResponderEvent,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CardVariant = 'default' | 'muted' | 'sunken';
export type CardElevation = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  elevation?: CardElevation;
  bordered?: boolean;
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
  testID?: string;
}

export function Card({
  children,
  variant = 'default',
  elevation = 'sm',
  bordered = false,
  onPress,
  style,
  className,
  testID,
}: CardProps) {
  const theme = useTheme();
  const bg =
    variant === 'muted' ? theme.cardMuted : variant === 'sunken' ? theme.cardSunken : theme.card;

  const content = (
    <View
      className={className}
      style={[
        styles.base,
        { backgroundColor: bg },
        bordered && { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border },
        Shadow[elevation],
        style,
      ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
        testID={testID}>
        {content}
      </Pressable>
    );
  }

  return <View testID={testID}>{content}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius['3xl'],
    padding: Spacing.md,
  },
});

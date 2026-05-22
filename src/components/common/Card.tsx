import {
  type GestureResponderEvent,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CardVariant = 'default' | 'muted' | 'sunken';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
  testID?: string;
}

export function Card({
  children,
  variant = 'default',
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
      style={[styles.base, { backgroundColor: bg, borderColor: theme.border }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        testID={testID}>
        {content}
      </Pressable>
    );
  }

  return <View testID={testID}>{content}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
});

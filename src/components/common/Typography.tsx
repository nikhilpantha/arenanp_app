import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { TypographyStyles, type TypographyVariant } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface TypographyProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: TextStyle['color'];
}

export function Typography({
  variant = 'body-md',
  color,
  style,
  children,
  ...rest
}: TypographyProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.ink;
  return (
    <RNText style={[TypographyStyles[variant], { color: resolvedColor }, style]} {...rest}>
      {children}
    </RNText>
  );
}

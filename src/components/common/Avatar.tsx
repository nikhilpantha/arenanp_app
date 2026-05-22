import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { useTheme } from '@/hooks/use-theme';

import { Typography } from './Typography';

export interface AvatarProps {
  src?: string;
  fallback: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Avatar({ src, fallback, size = 40, style, testID }: AvatarProps) {
  const theme = useTheme();
  const initials = fallback.slice(0, 2).toUpperCase();

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.cardSunken,
        },
        style,
      ]}
      testID={testID}>
      {src ? (
        <Image source={{ uri: src }} style={styles.image} contentFit="cover" />
      ) : (
        <Typography variant="label-md" color={theme.inkMuted}>
          {initials}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

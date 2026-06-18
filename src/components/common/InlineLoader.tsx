import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export interface InlineLoaderProps {
  /** Vertical padding around the spinner. */
  paddingVertical?: number;
}

/** Centered activity spinner for inline loading states (lists, sections, detail). */
export function InlineLoader({ paddingVertical = 24 }: InlineLoaderProps) {
  const theme = useTheme();
  return (
    <View style={{ paddingVertical, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={theme.primary} />
    </View>
  );
}

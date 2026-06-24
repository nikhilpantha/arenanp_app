import { RefreshControl, type RefreshControlProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type AppRefreshControlProps = RefreshControlProps;

/**
 * The app's pull-to-refresh spinner, themed to the brand primary (iOS `tintColor`
 * + Android `colors`). Drop it into any scroller's `refreshControl` prop, or feed
 * `refreshing` / `onRefresh` through `Screen` / `FormScreen` which build it for you.
 * Pair with the `useRefresh` hook for the `refreshing` flag + `onRefresh` handler.
 */
export function AppRefreshControl(props: AppRefreshControlProps) {
  const theme = useTheme();
  return <RefreshControl tintColor={theme.primary} colors={[theme.primary]} {...props} />;
}

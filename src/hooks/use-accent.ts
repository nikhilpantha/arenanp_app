import { useTheme } from '@/hooks/use-theme';

/**
 * The app's single brand accent — green (`primary`) for every screen and both roles.
 * Use this for primary CTAs, focus rings, accent borders, selection and key icons.
 *
 * Role no longer changes the accent: amber (`secondary`) is reserved for *semantic*
 * highlights only (Verified badge, ratings/stars, attention) and is applied directly via
 * `theme.secondary*`, never through this hook.
 */
export function useAccent() {
  const theme = useTheme();

  return {
    /** Vibrant brand accent for focus rings, borders, icons and fills. */
    accent: theme.primary,
    /** Brand accent with enough contrast for text/links on light surfaces. */
    accentText: theme.primary,
  };
}

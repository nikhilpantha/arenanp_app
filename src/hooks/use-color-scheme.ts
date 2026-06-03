import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * The app is locked to light mode for now. All dark-mode tokens (`Colors.dark`)
 * and component variants remain in place — flip `FORCE_LIGHT` to `false` to
 * re-enable system-driven theming.
 */
const FORCE_LIGHT = true;

export function useColorScheme(): 'light' | 'dark' {
  const system = useRNColorScheme();
  if (FORCE_LIGHT) return 'light';
  return system === 'dark' ? 'dark' : 'light';
}

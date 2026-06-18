import { useEffect, useState } from 'react';

/**
 * Returns a copy of `value` that only updates after `delayMs` of no changes.
 * Used to debounce search input before it hits a query (e.g. the team picker).
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

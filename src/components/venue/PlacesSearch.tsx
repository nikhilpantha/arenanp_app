import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, View } from 'react-native';

import { Icon, Input, Typography } from '@/components/common';
import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPlaceDetails, type PlacePrediction, placesConfigured, searchPlaces } from '@/lib/places';

import type { PickedLocation } from './location-picker.types';

interface PlacesSearchProps {
  /** Selected location label to show in the box (e.g. on draft resume). */
  value?: string;
  onSelect: (loc: PickedLocation) => void;
  /** Fired when the user edits the text away from the confirmed selection. */
  onClear?: () => void;
}

/**
 * Google Places search box that doubles as the venue's location field: it shows the
 * selected place, and editing it away from that selection clears the pick (so the parent
 * hides the map and prompts again). Renders nothing if the Places key isn't configured.
 */
export function PlacesSearch({ value, onSelect, onClear }: PlacesSearchProps) {
  const theme = useTheme();
  // Seeded from the selected value (covers draft resume — the step mounts after the
  // draft has loaded), then owned locally as the user types.
  const [query, setQuery] = useState(value ?? '');
  const [results, setResults] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  // Label of the last confirmed pick; typing away from it clears the selection.
  const [confirmed, setConfirmed] = useState(value ?? '');

  // Debounced autocomplete. State writes happen inside the async callback so a re-query
  // cleanly supersedes the previous one. Skips while the text still equals the pick.
  useEffect(() => {
    const q = query.trim();
    let cancelled = false;
    const t = setTimeout(async () => {
      if (q.length < 3 || q === confirmed) {
        if (!cancelled) setResults([]);
        return;
      }
      if (!cancelled) setLoading(true);
      const r = await searchPlaces(q);
      if (!cancelled) {
        setResults(r);
        setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, confirmed]);

  const handleChange = (text: string) => {
    setQuery(text);
    if (confirmed && text !== confirmed) {
      setConfirmed('');
      onClear?.();
    }
  };

  const pick = async (p: PlacePrediction) => {
    setConfirmed(p.primary);
    setQuery(p.primary);
    setResults([]);
    Keyboard.dismiss();
    const details = await getPlaceDetails(p.placeId);
    if (details) onSelect(details);
  };

  if (!placesConfigured) return null;

  const showResults =
    query.trim().length >= 3 && query.trim() !== confirmed && (loading || results.length > 0);

  return (
    <View className="gap-sm">
      <Input
        value={query}
        onChangeText={handleChange}
        placeholder="Search your venue location"
        leftIcon="mapPin"
        rightIcon={query ? 'x' : undefined}
        onRightIconPress={query ? () => handleChange('') : undefined}
        autoCorrect={false}
        returnKeyType="search"
      />
      {showResults ? (
        <View
          className="overflow-hidden rounded-2xl"
          style={[{ backgroundColor: theme.card }, Shadow.sm]}>
          {loading ? (
            <View className="items-center py-md">
              <ActivityIndicator color={theme.inkMuted} />
            </View>
          ) : (
            results.map((p, i) => (
              <Pressable
                key={p.placeId}
                onPress={() => pick(p)}
                className="flex-row items-center gap-sm px-md py-sm"
                style={
                  i < results.length - 1 ? { borderBottomWidth: 1, borderColor: theme.border } : undefined
                }>
                <Icon name="mapPin" size={18} color={theme.inkMuted} />
                <View className="flex-1">
                  <Typography variant="label-md" color={theme.ink}>
                    {p.primary}
                  </Typography>
                  {p.secondary ? (
                    <Typography
                      variant="label-sm"
                      color={theme.inkMuted}
                      style={{ textTransform: 'none' }}>
                      {p.secondary}
                    </Typography>
                  ) : null}
                </View>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

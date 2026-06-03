import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { Icon, Typography } from '@/components/common';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';

export interface PhotoGalleryPickerProps {
  label?: string;
  value: string[];
  onChange: (uris: string[]) => void;
  /** Max number of photos (default 6). */
  max?: number;
}

/**
 * Horizontal multi-image picker for additional gallery photos. Captures device URIs only
 * (upload is the backend's job). The cover photo is a separate field. Works in Expo Go.
 */
export function PhotoGalleryPicker({
  label = 'Photos',
  value,
  onChange,
  max = 6,
}: PhotoGalleryPickerProps) {
  const theme = useTheme();
  const { accent } = useAccent();

  const add = async () => {
    const remaining = max - value.length;
    if (remaining <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });
    if (!result.canceled) {
      onChange([...value, ...result.assets.map((a) => a.uri)].slice(0, max));
    }
  };

  const remove = (uri: string) => onChange(value.filter((u) => u !== uri));

  return (
    <View className="gap-sm">
      {label ? (
        <Typography variant="label-md" color={theme.inkMuted}>
          {label}
        </Typography>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}>
        {value.map((uri) => (
          <View
            key={uri}
            className="overflow-hidden rounded-2xl"
            style={{ width: 96, height: 96, backgroundColor: theme.cardMuted }}>
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
            <Pressable
              onPress={() => remove(uri)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
              <Icon name="x" size={14} color="#ffffff" />
            </Pressable>
          </View>
        ))}

        {value.length < max ? (
          <Pressable
            onPress={add}
            accessibilityRole="button"
            accessibilityLabel="Add photos"
            className="items-center justify-center gap-xs rounded-2xl border-2 border-dashed"
            style={{ width: 96, height: 96, borderColor: accent, backgroundColor: `${accent}0D` }}>
            <View
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${accent}1A` }}>
              <Icon name="plus" size={18} color={accent} />
            </View>
            <Typography variant="label-sm" color={accent}>
              Add
            </Typography>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

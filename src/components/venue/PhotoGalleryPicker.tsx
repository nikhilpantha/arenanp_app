import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { Icon, Typography } from '@/components/common';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';
import { type UploadCategory, uploadLocalFile, useDisplayUri } from '@/lib/api/uploads';

export interface PhotoGalleryPickerProps {
  label?: string;
  /** Stored S3 object keys. */
  value: string[];
  /** Called with the updated list of object keys. */
  onChange: (keys: string[]) => void;
  /** Upload bucket category — fixes the S3 prefix + accepted types. */
  category: UploadCategory;
  /** Max number of photos (default 6). */
  max?: number;
}

/** One gallery tile. Shows a fresh local preview if given, else presigns its key. */
function GalleryThumb({
  value,
  localPreview,
  onRemove,
}: {
  value: string;
  localPreview?: string;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const resolved = useDisplayUri(localPreview ? undefined : value);
  const uri = localPreview ?? resolved;

  return (
    <View
      className="overflow-hidden rounded-2xl"
      style={{ width: 96, height: 96, backgroundColor: theme.cardMuted }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.inkMuted} />
        </View>
      )}
      <Pressable
        onPress={onRemove}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Remove photo"
        className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <Icon name="x" size={14} color="#ffffff" />
      </Pressable>
    </View>
  );
}

/**
 * Horizontal multi-image picker. Each added image uploads straight to S3 via a
 * presigned URL and the stored object **keys** are emitted (never device URIs).
 * In-flight uploads show a spinner tile; freshly uploaded tiles reuse the local
 * preview, resumed-draft keys are presigned for display. Works in Expo Go.
 */
export function PhotoGalleryPicker({
  label = 'Photos',
  value,
  onChange,
  category,
  max = 6,
}: PhotoGalleryPickerProps) {
  const theme = useTheme();
  const { accent } = useAccent();

  // Local previews for keys uploaded this session (avoids a presign fetch).
  const [previews, setPreviews] = useState<Record<string, string>>({});
  // Device URIs currently uploading (shown as spinner tiles, no key yet).
  const [pending, setPending] = useState<string[]>([]);

  const total = value.length + pending.length;

  const add = async () => {
    const remaining = max - total;
    if (remaining <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });
    if (result.canceled) return;

    const assets = result.assets.slice(0, remaining);
    const uris = assets.map((a) => a.uri);
    setPending((p) => [...p, ...uris]);

    const uploaded: string[] = [];
    await Promise.all(
      assets.map(async (asset) => {
        try {
          const key = await uploadLocalFile(asset.uri, {
            category,
            contentType: asset.mimeType,
            fileName: asset.fileName ?? undefined,
          });
          setPreviews((prev) => ({ ...prev, [key]: asset.uri }));
          uploaded.push(key);
        } catch {
          // Skip failed uploads — the tile simply doesn't appear.
        } finally {
          setPending((p) => p.filter((u) => u !== asset.uri));
        }
      }),
    );

    if (uploaded.length) onChange([...value, ...uploaded].slice(0, max));
  };

  const remove = (key: string) => onChange(value.filter((k) => k !== key));

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
        {value.map((key) => (
          <GalleryThumb
            key={key}
            value={key}
            localPreview={previews[key]}
            onRemove={() => remove(key)}
          />
        ))}

        {pending.map((uri) => (
          <View
            key={uri}
            className="items-center justify-center overflow-hidden rounded-2xl"
            style={{ width: 96, height: 96, backgroundColor: theme.cardMuted }}>
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0.5 }}
              contentFit="cover"
            />
            <ActivityIndicator color="#ffffff" />
          </View>
        ))}

        {total < max ? (
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

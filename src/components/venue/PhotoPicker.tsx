import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { Icon, Typography } from '@/components/common';
import { Radius } from '@/constants/theme';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';
import { type UploadCategory, uploadLocalFile, useDisplayUri } from '@/lib/api/uploads';

export interface PhotoPickerProps {
  label: string;
  /** Stored S3 object key (or empty when unset). */
  value?: string;
  /** Called with the uploaded object key (or '' when cleared). */
  onChange: (key: string) => void;
  /** Upload bucket category — fixes the S3 prefix + accepted types. */
  category: UploadCategory;
  variant?: 'cover' | 'logo';
  /** Optional helper line under the label (cover only). */
  hint?: string;
  /** Empty-state call-to-action text (cover only). */
  addLabel?: string;
}

/**
 * Picks a single image, uploads it straight to S3 via a presigned URL, and emits
 * the stored object **key** (never the device URI). Shows the just-picked image
 * immediately while the upload runs in the background; a key persisted in a
 * resumed draft is previewed via a presigned URL. Works in Expo Go.
 */
export function PhotoPicker({
  label,
  value,
  onChange,
  category,
  variant = 'cover',
  hint,
  addLabel = 'Add cover photo',
}: PhotoPickerProps) {
  const theme = useTheme();
  const { accent } = useAccent();
  const isLogo = variant === 'logo';

  // Just-picked device URI, shown instantly so the preview doesn't wait on S3.
  const [localPreview, setLocalPreview] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [failed, setFailed] = useState(false);

  // Resolve a persisted key → presigned URL when there's no fresh local preview.
  const resolved = useDisplayUri(localPreview ? undefined : value);
  const displayUri = localPreview ?? resolved;

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: isLogo ? [1, 1] : [16, 9],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setLocalPreview(asset.uri);
    setFailed(false);
    setUploading(true);
    try {
      const key = await uploadLocalFile(asset.uri, {
        category,
        contentType: asset.mimeType,
        fileName: asset.fileName ?? undefined,
      });
      onChange(key);
    } catch {
      setFailed(true);
      setLocalPreview(undefined);
      onChange('');
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    setLocalPreview(undefined);
    setFailed(false);
    onChange('');
  };

  const size = isLogo
    ? { width: 96, height: 96, borderRadius: Radius['2xl'] }
    : { width: '100%' as const, height: 176, borderRadius: Radius['3xl'] };

  return (
    <View className="gap-sm">
      <View className="gap-[2px]">
        <Typography variant="label-md" color={theme.inkMuted}>
          {label}
        </Typography>
        {hint && !isLogo ? (
          <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
            {hint}
          </Typography>
        ) : null}
      </View>

      {displayUri ? (
        <View className="overflow-hidden" style={size}>
          <Image
            source={{ uri: displayUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          {uploading ? (
            <View
              className="absolute inset-0 items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
              <ActivityIndicator color="#ffffff" />
            </View>
          ) : (
            <Pressable
              onPress={clear}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
              <Icon name="x" size={15} color="#ffffff" />
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable
          onPress={pick}
          accessibilityRole="button"
          accessibilityLabel={label}
          className="items-center justify-center gap-xs border-2 border-dashed"
          style={[size, { borderColor: accent, backgroundColor: `${accent}0D` }]}>
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: isLogo ? 32 : 44,
              height: isLogo ? 32 : 44,
              backgroundColor: `${accent}1A`,
            }}>
            <Icon name="image" size={isLogo ? 18 : 24} color={accent} />
          </View>
          {!isLogo && (
            <Typography variant="label-md" color={failed ? theme.danger : accent}>
              {failed ? 'Upload failed — tap to retry' : addLabel}
            </Typography>
          )}
        </Pressable>
      )}
    </View>
  );
}

import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Image } from 'expo-image';

import { Icon, ImageCropper, Typography } from '@/components/common';
import { Radius } from '@/constants/theme';
import { useAccent } from '@/hooks/use-accent';
import { useImageCrop } from '@/hooks/use-image-crop';
import { useTheme } from '@/hooks/use-theme';
import { type UploadCategory, uploadLocalFile, useDisplayUri } from '@/lib/api/uploads';
import { type CroppedImage } from '@/lib/image-crop';

/** Cover images are always landscape 16:9, delivered at exactly 1600×900. */
const COVER_ASPECT = 16 / 9;
const COVER_OUTPUT = { width: 1600, height: 900 };

export interface CoverImageCropperProps {
  label: string;
  /** Helper line under the label. */
  hint?: string;
  /** Stored S3 object key (or empty when unset). */
  value?: string;
  /** Called with the uploaded object key (or '' when cleared). */
  onChange: (key: string) => void;
  /** Upload bucket category — fixes the S3 prefix + accepted types. */
  category?: UploadCategory;
  /** Empty-state call-to-action text. */
  addLabel?: string;
}

/**
 * Cover-photo field with a locked 16:9 crop. Tapping opens the library, then a custom
 * crop screen (pinch/pan, locked aspect); the confirmed crop is resized to exactly
 * 1600×900, compressed, uploaded to S3, and stored as an object key. The just-cropped
 * image previews instantly while the upload runs. Expo Go compatible.
 *
 * Use for single landscape cover images only. Gallery (multi-image) uploads don't crop.
 */
export function CoverImageCropper({
  label,
  hint,
  value,
  onChange,
  category = 'VENUE_COVER',
  addLabel = 'Add cover photo',
}: CoverImageCropperProps) {
  const theme = useTheme();
  const { accent } = useAccent();
  const { source, picking, pick, close } = useImageCrop();

  // Just-cropped device URI, shown instantly so the preview doesn't wait on S3.
  const [localPreview, setLocalPreview] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [failed, setFailed] = useState(false);

  const resolved = useDisplayUri(localPreview ? undefined : value);
  const displayUri = localPreview ?? resolved;

  const onCropped = async (image: CroppedImage) => {
    close();
    setLocalPreview(image.uri);
    setFailed(false);
    setUploading(true);
    try {
      const key = await uploadLocalFile(image.uri, { category, contentType: 'image/jpeg' });
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

  // 16:9 box so the 1600×900 cover shows at its true ratio (no re-cropping by the tile).
  const size = { width: '100%' as const, aspectRatio: 16 / 9, borderRadius: Radius['3xl'] };
  const busy = picking || uploading;

  return (
    <View className="gap-sm">
      <View className="gap-[2px]">
        <Typography variant="label-md" color={theme.inkMuted}>
          {label}
        </Typography>
        {hint ? (
          <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
            {hint}
          </Typography>
        ) : null}
      </View>

      {displayUri ? (
        <View className="overflow-hidden" style={size}>
          <Image source={{ uri: displayUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          {uploading ? (
            <View
              className="absolute inset-0 items-center justify-center"
              // Android paints expo-image over siblings unless overlays are elevated.
              style={{ backgroundColor: 'rgba(0,0,0,0.35)', elevation: 4, zIndex: 2 }}>
              <ActivityIndicator color="#ffffff" />
            </View>
          ) : (
            <View
              className="absolute right-2 top-2 flex-row gap-xs"
              style={{ elevation: 4, zIndex: 2 }}>
              <Pressable
                onPress={pick}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Change cover image"
                className="h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                <Icon name="image" size={14} color="#ffffff" />
              </Pressable>
              <Pressable
                onPress={clear}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Remove cover image"
                className="h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                <Icon name="x" size={15} color="#ffffff" />
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <Pressable
          onPress={pick}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={label}
          className="items-center justify-center gap-xs border-2 border-dashed"
          style={[size, { borderColor: accent, backgroundColor: `${accent}0D` }]}>
          {picking ? (
            <ActivityIndicator color={accent} />
          ) : (
            <>
              <View
                className="items-center justify-center rounded-full"
                style={{ width: 44, height: 44, backgroundColor: `${accent}1A` }}>
                <Icon name="image" size={24} color={accent} />
              </View>
              <Typography variant="label-md" color={failed ? theme.danger : accent}>
                {failed ? 'Upload failed — tap to retry' : addLabel}
              </Typography>
            </>
          )}
        </Pressable>
      )}

      <ImageCropper
        visible={Boolean(source)}
        uri={source?.uri}
        imageWidth={source?.width}
        imageHeight={source?.height}
        aspectRatio={COVER_ASPECT}
        output={COVER_OUTPUT}
        onCancel={close}
        onComplete={onCropped}
        title="Crop cover photo"
      />
    </View>
  );
}

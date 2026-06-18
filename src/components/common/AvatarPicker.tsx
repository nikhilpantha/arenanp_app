import { ActivityIndicator, Pressable, View } from 'react-native';
import { Image } from 'expo-image';

import { useAccent } from '@/hooks/use-accent';
import { useImageCrop } from '@/hooks/use-image-crop';
import { useTheme } from '@/hooks/use-theme';
import { type CroppedImage } from '@/lib/image-crop';

import { Icon } from './Icon';
import { ImageCropper } from './ImageCropper';
import { Typography } from './Typography';

/** Profile photos are square, delivered at 1024×1024. */
const AVATAR_OUTPUT = { width: 1024, height: 1024 };

export interface AvatarPickerProps {
  /** Local image URI, or empty/undefined when no picture is set. */
  value?: string;
  onChange: (uri: string) => void;
  /** Helper text shown under the avatar. */
  label?: string;
  /** Diameter of the circular avatar. */
  size?: number;
}

/**
 * Optional circular profile-picture picker. Opens the library, then a custom 1:1 crop
 * screen (pinch/pan), and emits the cropped local URI (uploading is handled later at
 * submit). Works in Expo Go.
 */
export function AvatarPicker({ value, onChange, label = 'Add a photo', size = 96 }: AvatarPickerProps) {
  const theme = useTheme();
  const { accent } = useAccent();
  const { source, picking, pick, close } = useImageCrop();

  const onCropped = (image: CroppedImage) => {
    close();
    onChange(image.uri);
  };

  const badge = Math.round(size * 0.32);

  return (
    <View className="items-center gap-sm">
      <Pressable
        onPress={pick}
        disabled={picking}
        accessibilityRole="button"
        accessibilityLabel={value ? 'Change profile photo' : 'Add profile photo'}>
        <View
          className="items-center justify-center overflow-hidden"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}>
          {picking ? (
            <ActivityIndicator color={accent} />
          ) : value ? (
            <Image source={{ uri: value }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <Icon name="user" size={Math.round(size * 0.42)} color={theme.inkMuted} />
          )}
        </View>
        <View
          className="absolute items-center justify-center rounded-full"
          style={{
            width: badge,
            height: badge,
            right: 0,
            bottom: 0,
            backgroundColor: accent,
            borderWidth: 2,
            borderColor: theme.bg,
          }}>
          <Icon name="camera" size={Math.round(badge * 0.55)} color="#ffffff" />
        </View>
      </Pressable>
      {label ? (
        <Typography variant="label-md" color={theme.inkMuted}>
          {label}
        </Typography>
      ) : null}

      <ImageCropper
        visible={Boolean(source)}
        uri={source?.uri}
        imageWidth={source?.width}
        imageHeight={source?.height}
        aspectRatio={1}
        output={AVATAR_OUTPUT}
        onCancel={close}
        onComplete={onCropped}
        title="Crop profile photo"
        rounded
      />
    </View>
  );
}

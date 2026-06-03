import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './Icon';
import { Typography } from './Typography';

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
 * Optional circular profile-picture picker. Captures only the device URI — uploading
 * is the backend's job (TODO). Works in Expo Go. The accent badge signals it's tappable.
 */
export function AvatarPicker({
  value,
  onChange,
  label = 'Add a photo',
  size = 96,
}: AvatarPickerProps) {
  const theme = useTheme();
  const { accent } = useAccent();

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) onChange(result.assets[0].uri);
  };

  const badge = Math.round(size * 0.32);

  return (
    <View className="items-center gap-sm">
      <Pressable
        onPress={pick}
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
          {value ? (
            <Image
              source={{ uri: value }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
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
    </View>
  );
}

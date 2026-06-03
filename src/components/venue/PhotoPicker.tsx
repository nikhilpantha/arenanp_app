import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { Icon, Typography } from '@/components/common';
import { Radius } from '@/constants/theme';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';

export interface PhotoPickerProps {
  label: string;
  value?: string;
  onChange: (uri: string) => void;
  variant?: 'cover' | 'logo';
  /** Optional helper line under the label (cover only). */
  hint?: string;
  /** Empty-state call-to-action text (cover only). */
  addLabel?: string;
}

/**
 * Picks a single local image. Only the device URI is captured here — uploading is
 * the backend's job (TODO). Shares the dashed-accent empty state + circular remove
 * button with PhotoGalleryPicker so all photo inputs read as one component. Works in Expo Go.
 */
export function PhotoPicker({
  label,
  value,
  onChange,
  variant = 'cover',
  hint,
  addLabel = 'Add cover photo',
}: PhotoPickerProps) {
  const theme = useTheme();
  const { accent } = useAccent();
  const isLogo = variant === 'logo';

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: isLogo ? [1, 1] : [16, 9],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) onChange(result.assets[0].uri);
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

      {value ? (
        <View className="overflow-hidden" style={size}>
          <Image source={{ uri: value }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          <Pressable
            onPress={() => onChange('')}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Remove photo"
            className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
            <Icon name="x" size={15} color="#ffffff" />
          </Pressable>
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
            <Typography variant="label-md" color={accent}>
              {addLabel}
            </Typography>
          )}
        </Pressable>
      )}
    </View>
  );
}

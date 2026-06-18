import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { prepareSource, type WorkingImage } from '@/lib/image-crop';

/**
 * Drives the "pick → (downscale) → crop" handoff for the croppers. Owns library
 * permission, launches the picker WITHOUT the OS editor (we crop ourselves), bounds
 * very large picks to a working size, and exposes the pending source for `ImageCropper`.
 *
 * Cancellation is first-class: a cancelled picker leaves `source` null, and `close()`
 * clears it after a crop completes (or the user backs out of the cropper).
 */
export function useImageCrop() {
  const [source, setSource] = useState<WorkingImage | null>(null);
  const [picking, setPicking] = useState(false);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      if (!perm.canAskAgain) {
        Alert.alert(
          'Photo access needed',
          'Enable photo access in Settings to choose an image.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
      return;
    }

    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        // No `allowsEditing`: cropping is handled by our custom ImageCropper.
        quality: 1,
        exif: false,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      setSource(await prepareSource(asset.uri, asset.width, asset.height));
    } catch {
      Alert.alert('Could not open photo', 'Something went wrong picking that image. Try again.');
    } finally {
      setPicking(false);
    }
  };

  const close = () => setSource(null);

  return { source, picking, pick, close };
}

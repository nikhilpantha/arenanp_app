import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal as RNModal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { Radius } from '@/constants/theme';
import { type CroppedImage, cropToSize } from '@/lib/image-crop';

import { Button } from './Button';
import { Icon } from './Icon';
import { Typography } from './Typography';

const MAX_SCALE = 5;
/** Reserved vertical space for the top + bottom chrome around the crop area. */
const TOP_BAR = 56;
const BOTTOM_BAR = 112;

export interface ImageCropperProps {
  visible: boolean;
  /** Source image to crop (a local working URI). */
  uri?: string;
  /** Source pixel dimensions (from the picker / pre-resize step). */
  imageWidth?: number;
  imageHeight?: number;
  /** Locked crop aspect ratio, width ÷ height (e.g. 16/9 for cover, 1 for avatar). */
  aspectRatio: number;
  /** Exact output dimensions the crop is resized to. */
  output: { width: number; height: number };
  onCancel: () => void;
  onComplete: (result: CroppedImage) => void;
  title?: string;
  doneLabel?: string;
  /** JPEG compression 0..1 (default from the lib). */
  compress?: number;
  /** Fully round the frame (avatar look). The saved image stays rectangular. */
  rounded?: boolean;
}

/**
 * Full-screen, reusable crop screen with a locked aspect ratio. The image pans and
 * pinch-zooms behind a fixed frame (always kept covered — no empty gutters), then the
 * selected rectangle is cropped and resized to an exact `output` size for upload.
 *
 * Used by `CoverImageCropper` (16:9 → 1600×900) and `AvatarPicker` (1:1). Modern
 * "move & scale" UX à la Playo / Airbnb. Expo Go compatible.
 */
export function ImageCropper({
  visible,
  uri,
  imageWidth,
  imageHeight,
  aspectRatio,
  output,
  onCancel,
  onComplete,
  title = 'Move and scale',
  doneLabel = 'Use photo',
  compress,
  rounded = false,
}: ImageCropperProps) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [processing, setProcessing] = useState(false);

  // Crop area = the middle region between the top/bottom chrome, INSIDE the safe area.
  // The safe-area insets must be subtracted too, or the bottom bar overflows off-screen.
  const areaW = screenW;
  const areaH = Math.max(0, screenH - TOP_BAR - BOTTOM_BAR - insets.top - insets.bottom);

  // Frame: as wide as the screen, height from the aspect — but never taller than the area.
  let frameW = areaW;
  let frameH = frameW / aspectRatio;
  if (frameH > areaH) {
    frameH = areaH;
    frameW = frameH * aspectRatio;
  }

  // Base "cover" layout: at scale 1 the image exactly covers the frame on its tight axis.
  const imgW = imageWidth ?? 1;
  const imgH = imageHeight ?? 1;
  const baseScale = Math.max(frameW / imgW, frameH / imgH);
  const baseW = imgW * baseScale;
  const baseH = imgH * baseScale;

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  // Reset the transform whenever a new image is loaded into the cropper.
  useEffect(() => {
    scale.value = 1;
    savedScale.value = 1;
    tx.value = 0;
    ty.value = 0;
    savedTx.value = 0;
    savedTy.value = 0;
  }, [uri, scale, savedScale, tx, ty, savedTx, savedTy]);

  // Keep the frame covered: clamp pan to the image edges for the current scale.
  const clampTranslation = (s: number) => {
    'worklet';
    const maxTx = Math.max(0, (baseW * s - frameW) / 2);
    const maxTy = Math.max(0, (baseH * s - frameH) / 2);
    tx.value = withTiming(Math.min(Math.max(tx.value, -maxTx), maxTx), { duration: 120 });
    ty.value = withTiming(Math.min(Math.max(ty.value, -maxTy), maxTy), { duration: 120 });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    })
    .onEnd(() => {
      clampTranslation(scale.value);
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 1), MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      clampTranslation(scale.value);
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const confirm = async () => {
    if (!uri || processing) return;
    // Map the on-screen frame back to source pixels for the current transform.
    const s = scale.value;
    const totalScale = baseScale * s;
    const cropW = frameW / totalScale;
    const cropH = frameH / totalScale;
    const rawX = imgW / 2 - cropW / 2 - tx.value / totalScale;
    const rawY = imgH / 2 - cropH / 2 - ty.value / totalScale;
    const cropX = Math.min(Math.max(rawX, 0), Math.max(0, imgW - cropW));
    const cropY = Math.min(Math.max(rawY, 0), Math.max(0, imgH - cropH));

    setProcessing(true);
    try {
      const result = await cropToSize(
        uri,
        { originX: cropX, originY: cropY, width: cropW, height: cropH },
        output,
        compress,
      );
      onComplete({ uri: result.uri, width: result.width, height: result.height });
    } catch {
      // Surface nothing destructive — keep the cropper open so the user can retry.
    } finally {
      setProcessing(false);
    }
  };

  const ready = Boolean(uri && imageWidth && imageHeight && areaH > 0);

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCancel}
      presentationStyle="overFullScreen"
      transparent>
      {/* RN Modal renders in its own native window outside the app's root
          GestureHandlerRootView, so gestures (esp. on Android) need a root here. */}
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          {/* Top bar */}
          <View
            style={{ height: TOP_BAR }}
            className="flex-row items-center justify-between px-lg">
            <Pressable
              onPress={onCancel}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Cancel">
              <Icon name="x" size={26} color="#ffffff" />
            </Pressable>
            <Typography variant="label-lg" color="#ffffff" style={{ textTransform: 'none' }}>
              {title}
            </Typography>
            {/* Spacer to keep the title centered. */}
            <View style={{ width: 26 }} />
          </View>

          {/* Crop area */}
          <View style={{ width: areaW, height: areaH, overflow: 'hidden' }}>
            {ready ? (
              <GestureDetector gesture={composed}>
                <View style={{ flex: 1 }}>
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        left: (areaW - baseW) / 2,
                        top: (areaH - baseH) / 2,
                        width: baseW,
                        height: baseH,
                      },
                      imageStyle,
                    ]}>
                    <Image
                      source={{ uri }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </Animated.View>

                  {/* Dim everything outside the frame (four bands). */}
                  <DimBands areaW={areaW} areaH={areaH} frameW={frameW} frameH={frameH} />

                  {/* Frame outline */}
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: (areaW - frameW) / 2,
                      top: (areaH - frameH) / 2,
                      width: frameW,
                      height: frameH,
                      borderWidth: 2,
                      borderColor: 'rgba(255,255,255,0.9)',
                      borderRadius: rounded ? frameH / 2 : Radius.lg,
                    }}
                  />
                </View>
              </GestureDetector>
            ) : (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator color="#ffffff" />
              </View>
            )}

            {processing ? (
              <View
                className="absolute inset-0 items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <ActivityIndicator color="#ffffff" size="large" />
              </View>
            ) : null}
          </View>

          {/* Bottom bar */}
          <View style={{ height: BOTTOM_BAR }} className="justify-center px-lg">
            <Button
              size="lg"
              fullWidth
              className="rounded-full"
              rightIcon="check"
              loading={processing}
              onPress={confirm}>
              {doneLabel}
            </Button>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </RNModal>
  );
}

/** Four semi-opaque bands that dim the image outside the centered crop frame. */
function DimBands({
  areaW,
  areaH,
  frameW,
  frameH,
}: {
  areaW: number;
  areaH: number;
  frameW: number;
  frameH: number;
}) {
  const sideX = (areaW - frameW) / 2;
  const sideY = (areaH - frameH) / 2;
  const dim = 'rgba(0,0,0,0.55)';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: sideY, backgroundColor: dim }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: sideY, backgroundColor: dim }} />
      <View style={{ position: 'absolute', left: 0, top: sideY, width: sideX, height: frameH, backgroundColor: dim }} />
      <View style={{ position: 'absolute', right: 0, top: sideY, width: sideX, height: frameH, backgroundColor: dim }} />
    </View>
  );
}

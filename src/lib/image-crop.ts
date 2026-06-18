import { ImageManipulator, type ImageResult, SaveFormat } from 'expo-image-manipulator';

/**
 * Image cropping pipeline shared by the cover and profile croppers.
 *
 * Two jobs:
 *  • `prepareSource` — downscale an arbitrarily large pick to a bounded working size so
 *    the on-screen cropper and the final crop stay memory-cheap (phones routinely return
 *    12MP+ images; loading those raw into a gesture view is wasteful and can OOM).
 *  • `cropToSize` — crop the user's selected rectangle, then resize to an EXACT output
 *    (e.g. 1600×900) and JPEG-compress for upload.
 *
 * All work runs through `expo-image-manipulator` (Expo Go compatible — no native setup).
 */

/** Longest edge (px) the working image is downscaled to before cropping. */
const WORK_MAX_EDGE = 2048;
/** Default JPEG compression for upload-ready output (0..1; higher = better quality). */
const DEFAULT_COMPRESS = 0.85;

export interface WorkingImage {
  uri: string;
  width: number;
  height: number;
}

/** A crop rectangle in **source-image pixels**. */
export interface CropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export interface CroppedImage {
  uri: string;
  width: number;
  height: number;
}

/**
 * Bound a freshly-picked image to a sane working size. Returns the original untouched
 * when it's already within bounds (no needless re-encode). `width`/`height` come from
 * the picker asset; we fall back to a manipulator round-trip only when they're missing.
 */
export async function prepareSource(
  uri: string,
  width?: number,
  height?: number,
): Promise<WorkingImage> {
  if (width && height && Math.max(width, height) <= WORK_MAX_EDGE) {
    return { uri, width, height };
  }

  const context = ImageManipulator.manipulate(uri);
  if (width && height) {
    const longest = Math.max(width, height);
    const ratio = WORK_MAX_EDGE / longest;
    context.resize({
      width: Math.round(width * ratio),
      height: Math.round(height * ratio),
    });
  } else {
    // Unknown dimensions: cap the longest edge by resizing width and letting height follow.
    context.resize({ width: WORK_MAX_EDGE });
  }
  const ref = await context.renderAsync();
  const saved = await ref.saveAsync({ compress: 0.9, format: SaveFormat.JPEG });
  return { uri: saved.uri, width: saved.width, height: saved.height };
}

/**
 * Crop the given rectangle out of `uri`, then resize to exactly `output` and compress.
 * The crop rect already matches the output aspect ratio (the cropper enforces it), so the
 * resize is a pure scale — the result is always precisely `output.width × output.height`.
 */
export async function cropToSize(
  uri: string,
  crop: CropRect,
  output: { width: number; height: number },
  compress: number = DEFAULT_COMPRESS,
): Promise<ImageResult> {
  const context = ImageManipulator.manipulate(uri);
  context.crop({
    originX: Math.round(crop.originX),
    originY: Math.round(crop.originY),
    width: Math.round(crop.width),
    height: Math.round(crop.height),
  });
  context.resize({ width: output.width, height: output.height });
  const ref = await context.renderAsync();
  return ref.saveAsync({ compress, format: SaveFormat.JPEG });
}

import { useMutation, useQuery } from '@tanstack/react-query';

import { gqlRequest } from './client';
import { CREATE_UPLOAD_URL, MEDIA_URL } from './operations';

/**
 * Media upload helper. Mirrors the backend two-step flow for a private S3 bucket:
 *   1. `createUploadUrl` → presigned PUT URL + the object `key` to persist
 *   2. PUT the file bytes straight to S3
 *   3. send the returned `key` (NOT the URL) into the domain mutation
 *      (updateProfile.avatarUrl, submitVenue.coverImageUrl/imageUrls/documentUrls, …)
 *
 * Stored values are object keys; the backend presigns them back into temporary
 * download URLs on read. See arenanp_backend/src/storage.
 */

/** Upload kinds — must match the backend `UploadCategory` enum. */
export type UploadCategory =
  | 'AVATAR'
  | 'VENUE_COVER'
  | 'VENUE_IMAGE'
  | 'VENUE_DOCUMENT'
  | 'COURT_IMAGE'
  | 'TOURNAMENT_COVER'
  | 'TOURNAMENT_IMAGE'
  | 'ORGANIZER_DOCUMENT'
  | 'SPORT_ICON';

interface PresignedUpload {
  key: string;
  uploadUrl: string;
  method: string;
  contentType: string;
  expiresIn: number;
  maxBytes: number;
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  pdf: 'application/pdf',
};

/**
 * True for on-device file references (image picker / camera results). Anything
 * else (an existing S3 key or an http(s) URL) is already persisted and is passed
 * through unchanged, so re-saving a form never re-uploads untouched files.
 */
export function isLocalUri(uri?: string | null): uri is string {
  return !!uri && /^(file|content|ph|assets-library):/i.test(uri);
}

/** Best-effort MIME guess from a URI's extension; defaults to JPEG for images. */
export function guessContentType(uri: string, explicit?: string): string {
  if (explicit) return explicit;
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  return (ext && MIME_BY_EXT[ext]) || 'image/jpeg';
}

async function requestUploadUrl(input: {
  category: UploadCategory;
  contentType: string;
  filename?: string;
}): Promise<PresignedUpload> {
  const r = await gqlRequest<{ createUploadUrl: PresignedUpload }>(CREATE_UPLOAD_URL, { input });
  return r.createUploadUrl;
}

async function putToS3(uploadUrl: string, uri: string, contentType: string): Promise<void> {
  // RN fetch reads the local file into a Blob, then streams it to the presigned URL.
  const fileRes = await fetch(uri);
  const blob = await fileRes.blob();
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}). Please try again.`);
  }
}

export interface UploadOptions {
  category: UploadCategory;
  /** Override the inferred MIME type. */
  contentType?: string;
  /** Original filename — only used to derive the extension. */
  fileName?: string;
}

/**
 * Upload one local file and resolve to the S3 object **key** to persist.
 * Non-local values (existing keys / remote URLs) resolve unchanged, so this is
 * safe to call over a mixed list of new + already-uploaded items.
 */
export async function uploadLocalFile(uri: string, opts: UploadOptions): Promise<string> {
  if (!isLocalUri(uri)) return uri;
  const contentType = guessContentType(uri, opts.contentType);
  const presigned = await requestUploadUrl({
    category: opts.category,
    contentType,
    filename: opts.fileName,
  });
  await putToS3(presigned.uploadUrl, uri, contentType);
  return presigned.key;
}

/** Upload many local files in parallel, preserving order; non-local entries pass through. */
export function uploadLocalFiles(uris: string[], opts: UploadOptions): Promise<string[]> {
  return Promise.all(uris.map((uri) => uploadLocalFile(uri, opts)));
}

/**
 * React-query mutation wrapper for ad-hoc uploads from a screen (e.g. upload on
 * pick, then store the key in form state). Returns the object key.
 */
export function useUploadMedia() {
  return useMutation({
    mutationFn: ({ uri, ...opts }: { uri: string } & UploadOptions) => uploadLocalFile(uri, opts),
  });
}

function isDirectlyDisplayable(value?: string | null): value is string {
  return !!value && (isLocalUri(value) || /^https?:\/\//i.test(value));
}

/**
 * Resolve a stored object key into a fresh presigned download URL. No-op (disabled)
 * for empty values and for already-displayable ones (local URIs / http URLs). Cached
 * for under the 1-hour presign window so previews don't re-fetch on every render.
 */
export function useMediaUrl(keyOrUri?: string | null) {
  return useQuery({
    queryKey: ['mediaUrl', keyOrUri],
    enabled: !!keyOrUri && !isDirectlyDisplayable(keyOrUri),
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const r = await gqlRequest<{ mediaUrl: string | null }>(MEDIA_URL, { key: keyOrUri });
      return r.mediaUrl;
    },
  });
}

/**
 * Turn any stored image reference into something `<Image source={{ uri }}>` can
 * render: local URIs / http URLs pass through; object keys are presigned. Use in
 * pickers so a key persisted in a resumed draft still previews.
 */
export function useDisplayUri(value?: string | null): string | undefined {
  const { data } = useMediaUrl(value);
  if (!value) return undefined;
  return isDirectlyDisplayable(value) ? value : (data ?? undefined);
}

import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@/stores';

import { gqlRequest } from './client';
import { type ApiUser, UPDATE_PROFILE } from './operations';
import { isLocalUri, uploadLocalFile } from './uploads';

export interface ProfileUpdate {
  fullName: string;
  email?: string;
  /** Avatar value from the picker: a freshly-picked local URI, an existing key/URL, or empty. */
  photo?: string;
}

/**
 * Update the signed-in user's identity (name / email / avatar). A newly-picked
 * avatar (local URI) is uploaded first; an untouched one is left as-is. On success
 * we re-hydrate the auth store so every screen reflects the change.
 */
export function useUpdateProfile() {
  const reloadIdentity = useAuthStore((s) => s.reloadIdentity);
  return useMutation({
    mutationFn: async ({ fullName, email, photo }: ProfileUpdate) => {
      const input: { fullName: string; email?: string; avatarUrl?: string } = {
        fullName: fullName.trim(),
      };
      const trimmedEmail = email?.trim();
      if (trimmedEmail) input.email = trimmedEmail;
      // Only upload (and thus change) the avatar when the user picked a new local
      // image; an existing key / presigned URL is left untouched on the backend.
      if (photo && isLocalUri(photo)) {
        input.avatarUrl = await uploadLocalFile(photo, { category: 'AVATAR' });
      }
      return gqlRequest<{ updateProfile: ApiUser }>(UPDATE_PROFILE, { input });
    },
    onSuccess: () => reloadIdentity(),
  });
}

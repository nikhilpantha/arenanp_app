import { ActivityIndicator, View } from 'react-native';

import { EditProfileForm } from '@/components/account/EditProfileForm';
import { useMediaUrl } from '@/lib/api/uploads';
import { useAuthStore } from '@/stores';

/**
 * Shared "Edit profile" screen — pushed from both the player profile tab and the
 * venue-owner account page. Edits the signed-in user's name / email / avatar.
 * We resolve the stored avatar key to a display URI first so the picker prefills.
 */
export default function EditProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const avatar = useMediaUrl(profile?.avatarUrl);

  // Wait for the avatar to presign so the form's initial value is stable (RHF
  // applies defaultValues once on mount).
  if (!profile || avatar.isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <EditProfileForm
      phone={profile.phone}
      initialValues={{
        fullName: profile.fullName ?? '',
        email: profile.email ?? '',
        photo: avatar.data ?? profile.avatarUrl ?? '',
      }}
    />
  );
}

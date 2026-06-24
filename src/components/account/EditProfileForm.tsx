import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormScreen, Input, ScreenHeader, Typography, useToast } from '@/components/common';
import { FormAvatarPicker, FormInput } from '@/components/form';
import { useTheme } from '@/hooks/use-theme';
import { isApiConfigured } from '@/lib/api/client';
import { useUpdateProfile } from '@/lib/api/profile';
import { type EditProfileFormValues, editProfileSchema } from '@/lib/auth-schemas';
import { useYupForm } from '@/lib/forms';

export interface EditProfileFormProps {
  /** Initial identity values (avatar prefilled with a display URI, if any). */
  initialValues: EditProfileFormValues;
  /** The login number — shown read-only (changed via account security, not here). */
  phone?: string;
}

/**
 * Shared "Edit profile" form for both panels. Edits name, email and avatar; the
 * phone (login identity) is read-only. Persists via `updateProfile`, which
 * re-hydrates the auth store so every screen reflects the change.
 */
export function EditProfileForm({ initialValues, phone }: EditProfileFormProps) {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const updateProfile = useUpdateProfile();

  const form = useYupForm<typeof editProfileSchema>({
    schema: editProfileSchema,
    defaultValues: initialValues,
  });
  const [busy, setBusy] = useState(false);

  const onSave = form.handleSubmit(async (values: EditProfileFormValues) => {
    if (busy) return;
    setBusy(true);
    try {
      if (isApiConfigured) {
        await updateProfile.mutateAsync({
          fullName: values.fullName,
          email: values.email,
          photo: values.photo,
        });
      }
      toast.success('Profile updated');
      router.back();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
      setBusy(false);
    }
  });

  return (
    <FormScreen
      scroll
      header={
        <View className="gap-lg">
          <ScreenHeader onBack={() => router.back()} />
          <View className="gap-sm">
            <Typography variant="headline-lg">Edit profile</Typography>
            <Typography variant="body-md" color={theme.inkMuted}>
              Update your name, email and profile photo.
            </Typography>
          </View>
        </View>
      }
      footer={
        <Button size="lg" fullWidth className="rounded-full" rightIcon="check" loading={busy} onPress={onSave}>
          Save changes
        </Button>
      }>
      <View className="items-center pb-lg">
        <FormAvatarPicker control={form.control} name="photo" label="Change photo" />
      </View>

      <View className="gap-md">
        <FormInput
          control={form.control}
          name="fullName"
          label="Full name"
          placeholder="Your name"
          leftIcon="user"
          autoCapitalize="words"
          textContentType="name"
        />
        <FormInput
          control={form.control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          leftIcon="mail"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        {phone ? (
          <Input
            label="Mobile number"
            value={phone}
            editable={false}
            leftIcon="phone"
            hint="Your number is used to sign in and can't be changed here."
          />
        ) : null}
      </View>
    </FormScreen>
  );
}

import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormScreen, ScreenHeader, toE164, Typography } from '@/components/common';
import { FormAvatarPicker, FormInput, FormPhoneInput } from '@/components/form';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';
import { type SignupFormValues, signupSchema } from '@/lib/auth-schemas';
import { useYupForm } from '@/lib/forms';
import { useAuthStore } from '@/stores';

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { accentText } = useAccent();
  const signUp = useAuthStore((s) => s.signUp);

  const form = useYupForm<typeof signupSchema>({
    schema: signupSchema,
    defaultValues: {
      photo: '',
      fullName: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = form.handleSubmit(async (values: SignupFormValues) => {
    setError(undefined);
    setSubmitting(true);
    const phone = toE164(values.phone);
    try {
      await signUp({ phone, password: values.password, fullName: values.fullName.trim() });
      router.push({ pathname: '/verify', params: { phone } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your account. Try again.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <FormScreen scroll header={<ScreenHeader onBack={() => router.back()} />}>
      <View className="gap-sm pb-xl">
        <Typography variant="headline-lg">Create your account</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          We&apos;ll text you a 6-digit code to verify your number.
        </Typography>
      </View>

      <View className="items-center pb-lg">
        <FormAvatarPicker control={form.control} name="photo" label="Add a photo (optional)" />
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
        <FormPhoneInput control={form.control} name="phone" label="Mobile number" />
        <FormInput
          control={form.control}
          name="address"
          label="Address"
          placeholder="City, area, etc."
          leftIcon="mapPin"
          autoCapitalize="words"
          textContentType="addressCityAndState"
        />
        <FormInput
          control={form.control}
          name="password"
          label="Password"
          placeholder="At least 8 characters"
          leftIcon="lock"
          secureTextEntry
          autoCapitalize="none"
        />
        <FormInput
          control={form.control}
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your password"
          leftIcon="lock"
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      {/* CTA lives in the scroll body (not a lifted footer) so the keyboard simply
          overlays it — the secondary link never gets pushed up. */}
      <View className="gap-sm pt-xl">
        {error && (
          <Typography variant="label-md" color={theme.danger} style={{ textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        <Button
          size="lg"
          fullWidth
          className="rounded-full"
          loading={submitting}
          onPress={onSubmit}>
          Send code
        </Button>
        <View className="flex-row items-center justify-center pt-sm">
          <Typography variant="body-md" color={theme.inkMuted}>
            Already have an account?{' '}
          </Typography>
          <Typography
            variant="label-lg"
            color={accentText}
            onPress={() => router.replace('/login')}>
            Log In
          </Typography>
        </View>
      </View>
    </FormScreen>
  );
}

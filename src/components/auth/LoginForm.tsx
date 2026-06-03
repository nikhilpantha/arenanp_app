import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, toE164, Typography } from '@/components/common';
import { FormInput, FormPhoneInput } from '@/components/form';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type LoginFormValues, loginSchema } from '@/lib/auth-schemas';
import { useYupForm } from '@/lib/forms';
import { useAuthStore } from '@/stores';
import type { UserRole } from '@/types';

export interface LoginFormProps {
  /** Drives the accent + where the auth links carry the role onward. */
  role?: UserRole;
}

/** The login form body: phone + password, forgot-password, CTA and the sign-up link. */
export function LoginForm({ role }: LoginFormProps) {
  const theme = useTheme();
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);

  // Single green brand accent for both roles. `role` is still carried onward to the
  // sign-up / forgot-password links below.
  const accent = theme.primary;

  const form = useYupForm<typeof loginSchema>({
    schema: loginSchema,
    defaultValues: { phone: '', password: '' },
  });

  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = form.handleSubmit(async (values: LoginFormValues) => {
    setError(undefined);
    setSubmitting(true);
    try {
      await signIn({ phone: toE164(values.phone), password: values.password });
      // onAuthStateChange hydrates the session → root guard routes to the right area.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not log you in. Check your details.');
      setSubmitting(false);
    }
  });

  return (
    <>
      <View className="gap-md">
        <FormPhoneInput control={form.control} name="phone" label="Mobile number" />
        <View className="gap-sm">
          <FormInput
            control={form.control}
            name="password"
            label="Password"
            placeholder="Your password"
            leftIcon="lock"
            secureTextEntry
            autoCapitalize="none"
          />
          <Typography
            variant="label-md"
            color={accent}
            style={{ textAlign: 'right' }}
            onPress={() => router.push({ pathname: '/forgot-password', params: { role } })}>
            Forgot password?
          </Typography>
        </View>

        {error && (
          <Typography variant="label-md" color={theme.danger} style={{ textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        <Button
          size="lg"
          fullWidth
          shadow
          rightIcon="arrowRight"
          style={{ borderRadius: Radius.full }}
          loading={submitting}
          onPress={onSubmit}>
          Log In
        </Button>
      </View>

      <View className="flex-row items-center justify-center">
        <Typography variant="body-md" color={theme.inkMuted}>
          Don&apos;t have an account?{' '}
        </Typography>
        <Typography
          variant="label-lg"
          color={accent}
          onPress={() => router.replace({ pathname: '/signup', params: { role } })}>
          Sign Up
        </Typography>
      </View>
    </>
  );
}

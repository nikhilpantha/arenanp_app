import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormScreen, Icon, ScreenHeader, Typography } from '@/components/common';
import { FormPhoneInput } from '@/components/form';
import { useTheme } from '@/hooks/use-theme';
import { type ForgotPasswordFormValues, forgotPasswordSchema } from '@/lib/auth-schemas';
import { useYupForm } from '@/lib/forms';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Single green brand accent.
  const accent = theme.primary;

  const form = useYupForm<typeof forgotPasswordSchema>({
    schema: forgotPasswordSchema,
    defaultValues: { phone: '' },
  });

  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = form.handleSubmit((_values: ForgotPasswordFormValues) => {
    setSubmitting(true);
    // TODO(backend): trigger a password-reset code via the auth provider. The app is
    // frontend-only for now, so we just confirm the request was accepted.
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 400);
  });

  if (sent) {
    return (
      <FormScreen
        header={<ScreenHeader onBack={() => router.back()} />}
        footer={
          <Button
            size="lg"
            fullWidth
            className="rounded-full"
            onPress={() => router.back()}>
            Back to login
          </Button>
        }>
        <View className="flex-1 items-center justify-center gap-lg">
          <View
            className="h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accent}14` }}>
            <Icon name="check" size={40} color={accent} />
          </View>
          <View className="items-center gap-sm">
            <Typography variant="headline-lg" style={{ textAlign: 'center' }}>
              Check your phone
            </Typography>
            <Typography
              variant="body-md"
              color={theme.inkMuted}
              style={{ textAlign: 'center', maxWidth: '85%' }}>
              If an account exists for that number, we&apos;ve sent a code to reset your password.
            </Typography>
          </View>
        </View>
      </FormScreen>
    );
  }

  return (
    <FormScreen
      header={<ScreenHeader onBack={() => router.back()} />}
      footer={
        <Button
          size="lg"
          fullWidth
          shadow
          rightIcon="arrowRight"
          className="rounded-full"
          loading={submitting}
          onPress={onSubmit}>
          Send reset code
        </Button>
      }>
      <View className="gap-sm pb-xl">
        <Typography variant="headline-lg">Reset password</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          Enter your mobile number and we&apos;ll text you a code to reset your password.
        </Typography>
      </View>

      <FormPhoneInput control={form.control} name="phone" label="Mobile number" />
    </FormScreen>
  );
}

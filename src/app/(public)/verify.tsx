import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, FormScreen, ScreenHeader, Typography } from '@/components/common';
import { FormOtpInput } from '@/components/form';
import { useTheme } from '@/hooks/use-theme';
import { getDevOtp } from '@/lib/api/dev-otp';
import { type VerifyOtpFormValues, verifyOtpSchema } from '@/lib/auth-schemas';
import { useYupForm } from '@/lib/forms';
import { useAuthStore } from '@/stores';

const RESEND_SECONDS = 30;
const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const form = useYupForm<typeof verifyOtpSchema>({
    schema: verifyOtpSchema,
    defaultValues: { code: '' },
  });
  const code = form.watch('code');
  const errorMsg = form.formState.errors.code?.message;

  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  // Dev-only: the stub OTP from the backend, shown so you can sign in without SMS.
  const [devCode, setDevCode] = useState<string | null>(__DEV__ ? getDevOtp() : null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const submit = form.handleSubmit(async ({ code }: VerifyOtpFormValues) => {
    setSubmitting(true);
    try {
      await verifyOtp({ phone, token: code });
      // Success → session created → root guard moves to role selection.
    } catch (e) {
      form.setError('code', {
        message: e instanceof Error ? e.message : 'Invalid code. Please try again.',
      });
      setSubmitting(false);
    }
  });

  const handleResend = async () => {
    try {
      await resendOtp({ phone });
      form.reset({ code: '' });
      setCountdown(RESEND_SECONDS);
      if (__DEV__) setDevCode(getDevOtp());
    } catch (e) {
      form.setError('code', {
        message: e instanceof Error ? e.message : 'Could not resend the code.',
      });
    }
  };

  return (
    <FormScreen
      header={<ScreenHeader onBack={() => router.back()} />}
      footer={
        <Button
          size="lg"
          fullWidth
          className="rounded-full"
          loading={submitting}
          disabled={code.length !== CODE_LENGTH}
          onPress={submit}>
          Verify
        </Button>
      }>
      <View className="gap-lg">
        <View className="gap-sm">
          <Typography variant="headline-lg">Verify your number</Typography>
          <Typography variant="body-md" color={theme.inkMuted}>
            Enter the 6-digit code sent to {phone}.
          </Typography>
        </View>

        <FormOtpInput
          control={form.control}
          name="code"
          length={CODE_LENGTH}
          onComplete={() => submit()}
        />

        {__DEV__ && devCode ? (
          <Typography
            variant="label-md"
            color={theme.primary}
            style={{ textAlign: 'center' }}
            onPress={() => form.setValue('code', devCode)}>
            Dev code: {devCode} (tap to fill)
          </Typography>
        ) : null}
        {errorMsg && (
          <Typography variant="label-md" color={theme.danger} style={{ textAlign: 'center' }}>
            {errorMsg}
          </Typography>
        )}

        <View className="items-center">
          {countdown > 0 ? (
            <Typography variant="body-md" color={theme.inkMuted}>
              Resend code in {countdown}s
            </Typography>
          ) : (
            <Typography variant="label-lg" color={theme.primary} onPress={handleResend}>
              Resend code
            </Typography>
          )}
        </View>
      </View>
    </FormScreen>
  );
}

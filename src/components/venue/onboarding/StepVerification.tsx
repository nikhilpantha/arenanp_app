import type { UseFormReturn } from 'react-hook-form';
import { View } from 'react-native';

import { Card, Icon, Typography } from '@/components/common';
import { FormInput } from '@/components/form';
import { PhotoPicker } from '@/components/venue/PhotoPicker';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';

import type { VenueFormValues } from './form';

type VerificationKey = 'panDoc' | 'businessRegDoc' | 'citizenshipDoc';

export function StepVerification({ form }: { form: UseFormReturn<VenueFormValues> }) {
  const theme = useTheme();
  const { accent } = useAccent();
  const verification = form.watch('verification');

  const setDoc = (key: VerificationKey, uri: string) =>
    form.setValue('verification', { ...(verification ?? {}), [key]: uri }, { shouldValidate: false });

  return (
    <View className="gap-lg">
      <Card variant="muted" elevation="none" className="flex-row items-start gap-sm">
        <Icon name="shield" size={20} color={accent} />
        <Typography variant="body-md" color={theme.inkMuted} style={{ flex: 1 }}>
          Optional — add documents to earn a <Typography color={accent}>Verified</Typography> badge
          that builds trust with players. You can skip this and add them later.
        </Typography>
      </Card>

      <FormInput
        control={form.control}
        name="verification.panNumber"
        label="PAN number (optional)"
        placeholder="e.g. 301234567"
        leftIcon="creditCard"
        autoCapitalize="characters"
      />

      <PhotoPicker
        variant="cover"
        label="PAN document"
        addLabel="Upload PAN document"
        value={verification?.panDoc}
        onChange={(uri) => setDoc('panDoc', uri)}
      />
      <PhotoPicker
        variant="cover"
        label="Business registration"
        addLabel="Upload business registration"
        value={verification?.businessRegDoc}
        onChange={(uri) => setDoc('businessRegDoc', uri)}
      />
      <PhotoPicker
        variant="cover"
        label="Citizenship"
        addLabel="Upload citizenship"
        value={verification?.citizenshipDoc}
        onChange={(uri) => setDoc('citizenshipDoc', uri)}
      />
    </View>
  );
}

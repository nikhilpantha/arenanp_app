import { useRouter } from 'expo-router';

import { Button, FormScreen, ScreenHeader } from '@/components/common';
import { ReasonStep, ScopeStep, WhenStep } from '@/components/venue/closures/closure-fields';
import { useClosureForm } from '@/components/venue/closures/use-closure-form';

/**
 * Add a closure / time block. Pick scope (one court or the whole venue), a unified
 * start→end date+time range, and an optional reason. RHF + Yup with inline errors;
 * conflicts (already-booked times) surface as a toast from the server message.
 */
export default function NewClosureScreen() {
  const router = useRouter();
  const form = useClosureForm();

  return (
    <FormScreen
      scroll
      header={<ScreenHeader title="Block time" onBack={() => router.back()} />}
      footer={
        <Button
          size="lg"
          fullWidth
          className="rounded-full"
          rightIcon="check"
          loading={form.submitting}
          onPress={form.submit}>
          Add block
        </Button>
      }>
      <ScopeStep form={form} />
      <WhenStep form={form} />
      <ReasonStep form={form} />
    </FormScreen>
  );
}

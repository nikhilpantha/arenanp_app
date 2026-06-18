import type { UseFormReturn } from 'react-hook-form';
import { View } from 'react-native';

import { FormInput, FormPhoneInput } from '@/components/form';
import { CoverImageCropper } from '@/components/venue/CoverImageCropper';
import { PhotoGalleryPicker } from '@/components/venue/PhotoGalleryPicker';

import type { VenueFormValues } from './form';

export function StepPhotosBasics({ form }: { form: UseFormReturn<VenueFormValues> }) {
  const coverPhoto = form.watch('coverPhoto');
  const photos = form.watch('photos') ?? [];

  return (
    <View className="gap-md">
      <CoverImageCropper
        label="Cover photo"
        hint="Landscape 16:9 — the main image shown on your listing"
        category="VENUE_COVER"
        value={coverPhoto}
        onChange={(key) => form.setValue('coverPhoto', key, { shouldValidate: true })}
      />
      <PhotoGalleryPicker
        label="More photos (optional)"
        category="VENUE_IMAGE"
        max={5}
        value={photos}
        onChange={(keys) => form.setValue('photos', keys, { shouldValidate: true })}
      />
      <FormInput
        control={form.control}
        name="venueName"
        label="Venue name"
        placeholder="e.g. Arena Futsal"
        leftIcon="building"
        autoCapitalize="words"
      />
      <FormInput
        control={form.control}
        name="description"
        label="Description (optional)"
        placeholder="Tell players what makes your venue great"
        multiline
      />
      <FormPhoneInput control={form.control} name="venuePhone" label="Venue contact number" />
      <FormPhoneInput
        control={form.control}
        name="contactPhone"
        label="Alternate contact (optional)"
      />
    </View>
  );
}

import type { UseFormReturn } from 'react-hook-form';
import { View } from 'react-native';

import { FormInput, FormPhoneInput } from '@/components/form';
import { PhotoGalleryPicker } from '@/components/venue/PhotoGalleryPicker';
import { PhotoPicker } from '@/components/venue/PhotoPicker';

import type { VenueFormValues } from './form';

export function StepPhotosBasics({ form }: { form: UseFormReturn<VenueFormValues> }) {
  const coverPhoto = form.watch('coverPhoto');
  const photos = form.watch('photos') ?? [];

  return (
    <View className="gap-md">
      <PhotoPicker
        label="Cover photo"
        hint="The main image shown on your listing"
        variant="cover"
        value={coverPhoto}
        onChange={(uri) => form.setValue('coverPhoto', uri, { shouldValidate: true })}
      />
      <PhotoGalleryPicker
        label="More photos (optional)"
        value={photos}
        onChange={(uris) => form.setValue('photos', uris, { shouldValidate: true })}
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

import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Button, FormScreen, ScreenHeader, Typography } from '@/components/common';
import { CustomerPicker } from '@/components/venue/bookings/CustomerPicker';
import { useEditBooking } from '@/components/venue/bookings/edit-booking/use-edit-booking';
import { CourtPicker } from '@/components/venue/bookings/new-booking/CourtPicker';
import { CustomerSection } from '@/components/venue/bookings/new-booking/CustomerSection';
import { WhenSection } from '@/components/venue/bookings/new-booking/WhenSection';
import { useTheme } from '@/hooks/use-theme';

export default function EditBookingScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const b = useEditBooking(id ?? '');

  return (
    <FormScreen
      scroll
      header={<ScreenHeader title="Edit booking" onBack={() => b.router.back()} />}
      footer={
        <Button
          size="lg"
          fullWidth
          className="rounded-full"
          rightIcon="check"
          disabled={!b.canSave}
          loading={b.saving}
          onPress={b.save}>
          Save changes
        </Button>
      }>
      {b.loading ? (
        <View className="items-center justify-center pt-xl">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : b.notFound ? (
        <Typography variant="body-md" color={theme.inkMuted} style={{ paddingTop: 16 }}>
          Booking not found.
        </Typography>
      ) : (
        <>
          <CourtPicker
            courts={b.courtPicker.courts}
            selectedId={b.courtPicker.selectedId}
            onSelect={b.courtPicker.onSelect}
          />

          <CustomerSection
            customer={b.customer.selected}
            loyalty={null}
            isNew={false}
            onOpenPicker={b.customer.open}
          />

          <WhenSection
            date={b.when.date}
            onDate={b.when.setDate}
            duration={b.when.duration}
            onDuration={b.when.setDuration}
            startTime={b.when.startTime}
            onStartTime={b.when.setStartTime}
            openSlots={b.when.openSlots}
          />

          <CustomerPicker
            visible={b.customer.pickerVisible}
            onClose={b.customer.close}
            onSelect={b.customer.pick}
          />
        </>
      )}
    </FormScreen>
  );
}

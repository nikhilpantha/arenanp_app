import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { useToast } from '@/components/common';
import { type PickedCustomer } from '@/components/venue/bookings/CustomerPicker';
import { useOpenSlots } from '@/components/venue/bookings/new-booking/use-open-slots';
import { useUpdateVenueBooking, useVenueBooking, useVenueCourts } from '@/lib/api/venue-bookings';
import { startIso } from '@/lib/time';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local YYYY-MM-DD + HH:MM from an ISO start (reverses `startIso`, which used local time). */
function splitStart(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** State + actions for editing a pending booking — reschedule and/or its customer. */
export function useEditBooking(bookingId: string) {
  const router = useRouter();
  const toast = useToast();
  const bookingQ = useVenueBooking(bookingId);
  const booking = bookingQ.data;
  const courts = useVenueCourts().data ?? [];
  const updateM = useUpdateVenueBooking();

  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [duration, setDuration] = useState(1);
  // Prefilled with the current customer (id '' = unchanged); a pick swaps in a real id.
  const [customer, setCustomer] = useState<PickedCustomer | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  // Prefill once when the booking loads (render-time reset, no effect needed).
  const [prefilledId, setPrefilledId] = useState<string | null>(null);
  if (booking && prefilledId !== booking.id) {
    setPrefilledId(booking.id);
    const { date: d, time } = splitStart(booking.startAt);
    setSelectedCourtId(booking.courtId);
    setDate(d);
    setStartTime(time);
    setDuration(Math.max(1, Math.round(booking.durationMinutes / 60)));
    setCustomer({ id: '', name: booking.customerName ?? 'Walk-in', phone: booking.customerPhone });
  }

  const courtName = courts.find((c) => c.id === selectedCourtId)?.name ?? booking?.courtName ?? '';
  const { openSlots, timeValid } = useOpenSlots({
    date,
    court: courtName,
    courtId: selectedCourtId,
    duration,
    startTime,
    setStartTime,
    excludeBookingId: bookingId,
  });

  const customerChanged = Boolean(customer && customer.id);

  const save = () => {
    updateM.mutate(
      {
        bookingId,
        courtId: selectedCourtId ?? undefined,
        startAt: date ? startIso(date, startTime) : undefined,
        durationMinutes: duration * 60,
        ...(customerChanged
          ? { customerId: customer!.id, customerName: customer!.name, customerPhone: customer!.phone }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success('Booking updated');
          router.back();
        },
        onError: (e) =>
          Alert.alert('Could not update', e instanceof Error ? e.message : 'Please try again.'),
      },
    );
  };

  return {
    router,
    loading: bookingQ.isLoading,
    notFound: !bookingQ.isLoading && !booking,
    courtPicker: { courts, selectedId: selectedCourtId, onSelect: setSelectedCourtId },
    customer: {
      selected: customer,
      pickerVisible,
      open: () => setPickerVisible(true),
      close: () => setPickerVisible(false),
      pick: setCustomer,
    },
    when: { date, setDate, duration, setDuration, startTime, setStartTime, openSlots },
    canSave: Boolean(booking) && timeValid && !!date,
    saving: updateM.isPending,
    save,
  };
}

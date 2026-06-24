import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as yup from 'yup';

import { useToast } from '@/components/common';
import { useCourtSlots, useVenueDetail } from '@/lib/api/discovery';
import {
  offerDiscount,
  type PlayerOffer,
  useAvailableOffers,
  useCreatePlayerBooking,
} from '@/lib/api/player-bookings';
import type { TimeSlot } from '@/lib/booking-slots';
import { startSlots } from '@/lib/court-availability';
import { sessionLengthLabel } from '@/lib/subscription-format';
import { todayIso } from '@/lib/time';

const MAX_HOURS = 6;

/** Validated on submit (the CTA is always enabled; errors surface above it). */
const bookingSchema = yup.object({
  courtId: yup.string().required('Choose a court to continue.'),
  startValue: yup.string().required('Pick a time slot.'),
});

/** All state + actions for the player booking flow (court → date → time → offer → request). */
export function usePlayerBooking() {
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ id: string; name?: string; courtId?: string }>();
  const venueId = params.id;

  const venueQ = useVenueDetail(venueId);
  const courts = venueQ.data?.courts ?? [];
  const venueName = venueQ.data?.name ?? params.name ?? 'Venue';

  const [picked, setPicked] = useState<string | undefined>(params.courtId || undefined);
  const courtId = picked ?? (courts.length === 1 ? courts[0].id : undefined);
  const court = courts.find((c) => c.id === courtId);

  const [date, setDate] = useState(() => todayIso());
  // Duration is counted in court slots, not fixed hours — a court's slot length
  // (slotMinutes) is the booking unit, so the total is always a whole number of slots.
  const [slotCount, setSlotCount] = useState(1);
  const [startValue, setStartValue] = useState('');

  const slotsQ = useCourtSlots(courtId, date);
  const slotMinutes = slotsQ.data?.slotMinutes ?? 60;
  const maxSlots = Math.max(1, Math.floor((MAX_HOURS * 60) / slotMinutes));
  const durationSlots = Math.max(1, Math.min(slotCount, maxSlots));
  const durationMinutes = durationSlots * slotMinutes;
  const durationLabel = sessionLengthLabel(durationMinutes);

  const starts = useMemo(
    () => startSlots(slotsQ.data?.slots ?? [], durationSlots, slotMinutes),
    [slotsQ.data, durationSlots, slotMinutes],
  );
  const gridSlots: TimeSlot[] = starts
    .filter((s) => s.available)
    .map((s) => ({ value: s.value, label: s.rangeLabel, available: s.available }));
  const selected = starts.find((s) => s.value === startValue && s.available);

  // Snap the start to the first open slot whenever court/date/duration changes.
  const key = `${courtId ?? ''}|${date}|${durationSlots}`;
  const [prevKey, setPrevKey] = useState('');
  if (key !== prevKey) {
    setPrevKey(key);
    if (!starts.some((s) => s.value === startValue && s.available)) {
      setStartValue(starts.find((s) => s.available)?.value ?? '');
    }
  }

  const offersQ = useAvailableOffers(venueId);
  const [offer, setOffer] = useState<PlayerOffer | null>(null);
  const [code, setCode] = useState('');

  const base = selected?.price ?? 0;
  const discount = offer ? offerDiscount(offer, base) : 0;
  const total = Math.max(0, base - discount);

  const createBooking = useCreatePlayerBooking();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const canBook = !!court && !!selected;
  const totalLabel = `Rs ${total}`;

  // CTA is always enabled — validate on press and surface Yup errors instead of disabling.
  const onSubmit = () => {
    try {
      bookingSchema.validateSync({ courtId, startValue }, { abortEarly: false });
      setErrors([]);
      setConfirmOpen(true);
    } catch (e) {
      setErrors(e instanceof yup.ValidationError ? e.errors : ['Please complete your booking.']);
    }
  };

  const submit = () => {
    if (!court || !selected) return;
    setSubmitError(null);
    createBooking.mutate(
      {
        courtId: court.id,
        startAt: selected.startAt,
        durationMinutes,
        offerCode: offer?.code ?? (code.trim() || undefined),
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          toast.success('Booking confirmed', `Your court at ${venueName} is reserved — pay at the venue`);
          router.replace('/my-games');
        },
        onError: (e) =>
          setSubmitError(e instanceof Error ? e.message : 'Could not book this slot. Please try again.'),
      },
    );
  };

  const reviewRows = [
    { label: 'Venue', value: venueName },
    { label: 'Court', value: court ? `${court.name} · ${court.sport.name}` : '—' },
    { label: 'Date', value: date },
    { label: 'Time', value: selected ? `${selected.rangeLabel} · ${durationLabel}` : '—' },
    ...(discount > 0 ? [{ label: 'Discount', value: `– Rs ${discount}` }] : []),
  ];

  return {
    router,
    loading: venueQ.isLoading,
    venueName,
    courts,
    court,
    courtId,
    setCourt: setPicked,
    when: {
      date,
      setDate,
      durationSlots,
      setDuration: setSlotCount,
      maxSlots,
      durationLabel,
      // Label a slot count by its real length, so a 3 hr court shows "3 hr", "6 hr".
      formatDuration: (n: number) => sessionLengthLabel(n * slotMinutes),
      slots: gridSlots,
      startValue,
      setStartValue,
      loading: slotsQ.isLoading,
      hasCourt: !!court,
    },
    offers: { list: offersQ.data ?? [], selected: offer, onSelect: setOffer, code, setCode },
    price: { base, discount, total, totalLabel },
    canBook,
    errors,
    onSubmit,
    confirm: {
      open: confirmOpen,
      close: () => {
        setConfirmOpen(false);
        setSubmitError(null);
      },
      submit,
      loading: createBooking.isPending,
      error: submitError,
      rows: reviewRows,
      totalLabel,
    },
  };
}

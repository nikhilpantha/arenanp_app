import { useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useToast } from '@/components/common';
import { type PickedCustomer } from '@/components/venue/bookings/CustomerPicker';
import { DOW } from '@/constants/bookings';
import { VENUE_COURTS } from '@/data/bookings';
import { useSportBySlug } from '@/lib/api/sports';
import { useBookingsApiEnabled, useCreateVenueBooking, useVenueCourts } from '@/lib/api/venue-bookings';
import { newBookingSchema } from '@/lib/booking-schemas';
import { useYupForm } from '@/lib/forms';
import { type SubjectOfferEntry } from '@/lib/offers';
import { startIso, to12h, to24h, todayIso } from '@/lib/time';
import { useOfferStore } from '@/stores';
import type { PaymentMethod, PaymentStatus } from '@/types';

import { computePricing, paymentLabel } from './new-booking.helpers';
import { useCustomerLoyalty } from './use-customer-loyalty';
import { useOpenSlots } from './use-open-slots';

/**
 * All state, derived values and actions for the New booking screen. Keeping the
 * logic here lets the screen stay a thin, readable composition of section
 * components. Discounts come only from the offers list (no manual discount).
 */
export function useNewBooking() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sport?: string;
    court?: string;
    // Court id + day pre-selected when opened from the booking calendar's empty slot.
    courtId?: string;
    date?: string;
    time?: string;
    price?: string;
    // Pre-selected customer (e.g. when starting a booking from a customer's screen).
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
  }>();
  const redeemClaim = useOfferStore((s) => s.redeemClaim);

  const toast = useToast();
  const apiEnabled = useBookingsApiEnabled();
  const courts = useVenueCourts().data ?? [];
  const createBooking = useCreateVenueBooking();

  const form = useYupForm<typeof newBookingSchema>({
    schema: newBookingSchema,
    defaultValues: { customerName: params.customerName ?? '', phone: params.customerPhone ?? '' },
  });

  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(params.courtId ?? null);
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
  // Pre-select the customer when opened from their screen.
  const [selectedCustomer, setSelectedCustomer] = useState<PickedCustomer | null>(() =>
    params.customerId
      ? { id: params.customerId, name: params.customerName ?? 'Customer', phone: params.customerPhone }
      : null,
  );
  const [date, setDate] = useState(() => params.date ?? todayIso());
  const [startTime, setStartTime] = useState(() => to24h(params.time) ?? '18:00');
  const [duration, setDuration] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [amountPaid, setAmountPaid] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [offer, setOffer] = useState<SubjectOfferEntry | null>(null);
  const [redeemLoyalty, setRedeemLoyalty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingWho, setPendingWho] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Court / sport / price: the venue's real courts (API) or the mock catalogue. Nothing
  // is pre-selected — staff must tap a court (params.court is an explicit calendar pick).
  const defaultCourt = VENUE_COURTS[0];
  const effectiveCourtId = selectedCourtId ?? courts.find((c) => c.name === params.court)?.id ?? null;
  const selectedCourt = courts.find((c) => c.id === effectiveCourtId) ?? null;
  const hasCourt = !apiEnabled || Boolean(selectedCourt);
  const sport = apiEnabled && selectedCourt ? selectedCourt.sportSlug : (params.sport ?? defaultCourt.sport);
  const court = apiEnabled && selectedCourt ? selectedCourt.name : (params.court ?? defaultCourt.name);
  const unitPrice =
    apiEnabled && selectedCourt
      ? selectedCourt.pricePerHour
      : params.price
        ? Number(params.price)
        : defaultCourt.pricePerSlot;
  const sportName = useSportBySlug(sport)?.name ?? sport;

  // Open start-time slots for this court + date + duration (auto-snaps the pick).
  const { openSlots, timeValid } = useOpenSlots({
    date,
    court,
    courtId: effectiveCourtId,
    duration,
    startTime,
    setStartTime,
  });

  // Loyalty for the selected customer (live by id; mock-by-phone in dev).
  const phone = form.watch('phone');
  const subjectId = selectedCustomer?.id;
  const {
    loyalty: individualLoyalty,
    isNew: isNewCustomer,
    freeGameReady,
    gamesPlayed: subjectGames,
  } = useCustomerLoyalty({ apiEnabled, customerId: subjectId, hasCustomer: Boolean(selectedCustomer), phone });

  // Reset the chosen offer / loyalty redemption when the subject changes (render-time).
  const subjectKey = subjectId ?? '';
  const [prevSubjectKey, setPrevSubjectKey] = useState(subjectKey);
  if (subjectKey !== prevSubjectKey) {
    setPrevSubjectKey(subjectKey);
    setOffer(null);
    if (redeemLoyalty) setRedeemLoyalty(false);
  }
  if (redeemLoyalty && !freeGameReady) setRedeemLoyalty(false);

  // Pricing — discount comes only from an applied offer (or a loyalty free game).
  const { base, effect, isFree, discountAmt, discountReason, total, totalLabel } = computePricing(
    unitPrice,
    duration,
    offer,
    redeemLoyalty,
  );

  const paid = Math.min(total, Number(amountPaid) || 0);
  const remaining = Math.max(0, total - paid);
  const displayTime = to12h(startTime);

  const finish = (who: string) => {
    if (offer?.claim) redeemClaim(offer.claim.id);
    if (!apiEnabled) {
      setConfirmOpen(false);
      toast.success(`${who} · ${court} · ${displayTime} · ${totalLabel}`, 'Booking confirmed');
      router.back();
      return;
    }
    if (!effectiveCourtId) {
      Alert.alert('No court available', 'This venue has no courts set up yet.');
      return;
    }
    createBooking.mutate(
      {
        courtId: effectiveCourtId,
        customerName: who,
        customerPhone: phone || undefined,
        customerType: 'individual',
        customerId: selectedCustomer?.id,
        startAt: startIso(date, startTime),
        durationMinutes: duration * 60,
        paymentStatus: isFree ? 'paid' : paymentStatus,
        amountPaid: isFree ? 0 : paymentStatus === 'partial' ? paid : paymentStatus === 'paid' ? total : 0,
        // `redeemFreeGame` is the validated loyalty path; `freeGame` is a manual comp.
        redeemFreeGame: redeemLoyalty,
        freeGame: effect.isFree && !redeemLoyalty,
        discountAmount: isFree ? 0 : discountAmt || undefined,
        notes: discountReason || undefined,
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          toast.success(`${who} · ${court} · ${displayTime} · ${totalLabel}`, 'Booking confirmed');
          router.back();
        },
        onError: (e) =>
          setSubmitError(e instanceof Error ? e.message : 'Could not create booking. Please try again.'),
      },
    );
  };

  const pickCustomer = (c: PickedCustomer) => {
    setSelectedCustomer(c);
    form.setValue('customerName', c.name, { shouldValidate: true });
    form.setValue('phone', c.phone ?? '', { shouldValidate: true });
  };

  const onConfirm = () => {
    if (!selectedCustomer)
      return Alert.alert('Select a customer', 'Choose or add a customer to book for.');
    setPendingWho(selectedCustomer.name);
    setConfirmOpen(true);
  };

  const confirmBooking = () => {
    setSubmitError(null);
    finish(pendingWho);
  };

  const reviewRows = [
    { label: 'Court', value: court },
    { label: 'Sport', value: sportName },
    { label: 'Customer', value: pendingWho },
    { label: 'Date', value: date },
    { label: 'Time', value: `${displayTime} · ${duration}h` },
    { label: 'Payment', value: paymentLabel(isFree, paymentStatus, total, paid, remaining) },
  ];

  return {
    router,
    apiEnabled,
    courts,
    // header/footer
    hasCourt,
    timeValid,
    totalLabel,
    onConfirm,
    // summary
    summary: { sport, sportName, court, displayTime, unitPrice, hasCourt },
    // court picker
    courtPicker: { courts, effectiveCourtId, onSelect: setSelectedCourtId },
    // customer
    customer: {
      selectedCustomer,
      pickerVisible: customerPickerVisible,
      open: () => setCustomerPickerVisible(true),
      close: () => setCustomerPickerVisible(false),
      pick: pickCustomer,
      loyalty: individualLoyalty,
      isNew: isNewCustomer,
    },
    // free game
    freeGame: { ready: freeGameReady, active: redeemLoyalty, toggle: () => setRedeemLoyalty((v) => !v) },
    // offers
    offers: {
      show: Boolean(subjectId) && !redeemLoyalty,
      subjectId: subjectId ?? '',
      games: subjectGames,
      sport,
      day: DOW[new Date().getDay()],
      hour: Number(startTime.split(':')[0]),
      selectedId: offer?.offer.id ?? null,
      onChange: setOffer,
    },
    // when
    when: { date, setDate, duration, setDuration, startTime, setStartTime, openSlots },
    // payment
    payment: {
      show: !isFree,
      status: paymentStatus,
      setStatus: setPaymentStatus,
      amountPaid,
      setAmountPaid,
      method,
      setMethod,
      paid,
      remaining,
      total,
    },
    // price summary
    price: { duration, base, discountAmt, discountReason: discountReason ?? '', isFree, totalLabel },
    // confirm modal
    confirm: {
      open: confirmOpen,
      close: () => {
        setConfirmOpen(false);
        setSubmitError(null);
      },
      submit: confirmBooking,
      loading: createBooking.isPending,
      error: submitError,
      rows: reviewRows,
      totalLabel,
    },
  };
}

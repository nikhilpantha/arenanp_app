import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  Button,
  ConfirmModal,
  Icon,
  Screen,
  ScreenHeader,
  Typography,
  useToast,
} from '@/components/common';
import { resolvePaymentBadge, resolveStatusBadge } from '@/components/venue/bookings/booking-meta';
import {
  BookingCustomerCard,
  BookingFacts,
  BookingHero,
} from '@/components/venue/bookings/BookingDetailCards';
import {
  CompleteBookingModal,
  type CompleteBookingPayload,
} from '@/components/venue/bookings/CompleteBookingModal';
import { CustomerInsights } from '@/components/venue/CustomerInsights';
import { getCustomerByPhone } from '@/data/customers';
import { useTheme } from '@/hooks/use-theme';
import { useSportBySlug } from '@/lib/api/sports';
import { useMyVenue } from '@/lib/api/venue';
import {
  useBookingsApiEnabled,
  useCompleteVenueBooking,
  useSetBookingStatus,
} from '@/lib/api/venue-bookings';
import { labelToMinutes } from '@/lib/time';
import type { BookingStatus } from '@/types';

/** Where the booking sits on its timeline — drives the single contextual action. */
type Phase = 'before' | 'during' | 'after' | 'terminal';

/** A friendly "Starts in 2h 30m" / "In progress" / "Game finished" line. */
function phaseHint(phase: Phase, startMs: number | null, endLabel?: string): string {
  if (phase === 'during') return endLabel ? `In progress · ends ${endLabel}` : 'In progress';
  if (phase === 'after') return 'Game finished · settle the bill';
  if (phase !== 'before' || startMs == null) return '';
  const mins = Math.max(0, Math.round((startMs - Date.now()) / 60000));
  if (mins < 60) return `Starts in ${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return m ? `Starts in ${h}h ${m}m` : `Starts in ${h}h`;
  return `Starts in ${Math.round(h / 24)}d`;
}

export default function BookingDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const p = useLocalSearchParams<{
    id?: string;
    sport?: string;
    court?: string;
    time?: string;
    date?: string;
    price?: string;
    customer?: string;
    phone?: string;
    status?: string;
    payment?: string;
    freeGame?: string;
  }>();

  const apiEnabled = useBookingsApiEnabled();
  const setStatusM = useSetBookingStatus();
  const completeM = useCompleteVenueBooking();
  const venueQ = useMyVenue();
  const toast = useToast();
  const status = (p.status as BookingStatus) ?? 'upcoming';

  // Phase: where the booking sits on its timeline. We parse the "5 PM – 6 PM" label
  // against the booking date so the screen offers the one action that fits right now.
  const [startLabel, endLabel] = (p.time ?? '').split('–').map((s) => s.trim());
  const dayMs = p.date ? new Date(`${p.date}T00:00:00`).getTime() : NaN;
  const startMin = startLabel ? labelToMinutes(startLabel) : null;
  const endMin = endLabel ? labelToMinutes(endLabel) : null;
  const startMs = Number.isNaN(dayMs) || startMin == null ? null : dayMs + startMin * 60_000;
  const endMs = Number.isNaN(dayMs) || endMin == null ? null : dayMs + endMin * 60_000;
  const terminal = status === 'completed' || status === 'cancelled' || status === 'no-show';
  const now = Date.now();
  const phase: Phase = terminal
    ? 'terminal'
    : startMs != null && now < startMs
      ? 'before'
      : endMs != null && now >= endMs
        ? 'after'
        : 'during';

  // Complete flow runs through a modal (add-ons + payment), kept open on error.
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  // Cancel runs through a confirm modal (only available before the game starts).
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const services = (venueQ.data?.additionalServices ?? []).map((a) => ({
    name: a.name,
    price: a.price ?? undefined,
  }));
  const basePrice = p.freeGame === '1' ? 0 : Number(p.price ?? 0) || 0;

  const completeBooking = (payload: CompleteBookingPayload) => {
    setCompleteError(null);
    const done = () => {
      setCompleteOpen(false);
      toast.success('Booking completed');
      router.back();
    };
    if (apiEnabled && p.id) {
      completeM.mutate(
        { bookingId: p.id, ...payload },
        {
          onSuccess: done,
          onError: (e) =>
            setCompleteError(e instanceof Error ? e.message : 'Could not complete booking.'),
        },
      );
    } else {
      done();
    }
  };

  const sportName = useSportBySlug(p.sport)?.name ?? p.sport ?? 'Sport';
  const freeGame = p.freeGame === '1';
  const statusMeta = resolveStatusBadge(p.status);
  const payMeta = resolvePaymentBadge(p.payment, freeGame);

  // Customer insights — the phone number is the loyalty card; match it to a known customer.
  const customer = p.phone ? getCustomerByPhone(p.phone) : null;

  const cancelBooking = () => {
    setCancelError(null);
    const done = () => {
      setCancelOpen(false);
      toast.success('Booking cancelled');
      router.back();
    };
    if (apiEnabled && p.id) {
      setStatusM.mutate(
        { bookingId: p.id, status: 'cancelled' },
        {
          onSuccess: done,
          onError: (e) =>
            setCancelError(e instanceof Error ? e.message : 'Could not cancel booking.'),
        },
      );
    } else {
      done();
    }
  };

  const facts = [
    { label: 'Date', value: p.date ?? '—' },
    { label: 'Time', value: p.time ?? '—' },
    { label: 'Court', value: p.court ?? '—' },
    { label: 'Amount', value: freeGame ? 'Free game' : p.price ? `Rs ${p.price}` : '—' },
  ];

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Booking" onBack={() => router.back()} />
      </View>

      <View className="mt-md gap-md">
        <BookingHero
          sportSlug={p.sport ?? ''}
          title={`${sportName} · ${p.court}`}
          time={p.time}
          status={statusMeta}
          payment={payMeta}
        />

        {p.customer ? (
          <BookingCustomerCard
            name={p.customer}
            phone={p.phone}
            onCall={() => toast.info(p.phone ? `Calling ${p.phone}…` : 'No number on file.')}
          />
        ) : null}

        {customer ? <CustomerInsights customer={customer} /> : null}

        <BookingFacts rows={facts} />
      </View>

      {/* One contextual action, driven by where the booking is on its timeline. */}
      {phase !== 'terminal' ? (
        <View className="gap-md pt-xl">
          {/* Timeline hint — the "show the time" banner before the game starts. */}
          <View
            className="flex-row items-center gap-sm rounded-2xl p-md"
            style={{ backgroundColor: theme.cardMuted }}>
            <Icon name="clock" size={18} color={theme.inkMuted} />
            <Typography variant="label-md" color={theme.inkMuted} style={{ flex: 1 }}>
              {phaseHint(phase, startMs, endLabel)}
            </Typography>
          </View>

          {phase === 'before' ? (
            // Before kickoff staff can reschedule/reassign it, or call it off.
            <View className="gap-sm">
              {p.id ? (
                <Button
                  size="lg"
                  fullWidth
                  className="rounded-full"
                  leftIcon="wrench"
                  onPress={() => router.push({ pathname: '/booking/edit/[id]', params: { id: p.id! } })}>
                  Edit booking
                </Button>
              ) : null}
              <Button
                variant="tertiary"
                size="lg"
                fullWidth
                className="rounded-full"
                leftIcon="x"
                disabled={setStatusM.isPending}
                onPress={() => setCancelOpen(true)}>
                Cancel booking
              </Button>
            </View>
          ) : (
            // Game underway or over → settle the bill.
            <Button
              size="lg"
              fullWidth
              className="rounded-full"
              rightIcon="check"
              disabled={completeM.isPending}
              onPress={() => setCompleteOpen(true)}>
              Mark complete
            </Button>
          )}
        </View>
      ) : null}

      <ConfirmModal
        visible={cancelOpen}
        onClose={() => {
          setCancelOpen(false);
          setCancelError(null);
        }}
        onConfirm={cancelBooking}
        title="Cancel this booking?"
        description="The slot is freed up for others and the customer loses this reservation. This can't be undone."
        confirmLabel="Cancel booking"
        cancelLabel="Keep"
        placement="center"
        destructive
        loading={setStatusM.isPending}
        error={cancelError}>
        <View className="gap-sm rounded-2xl p-md" style={{ backgroundColor: theme.cardMuted }}>
          {[
            { label: 'Booked by', value: p.customer ?? '—' },
            { label: 'Sport', value: sportName },
            { label: 'Court', value: p.court ?? '—' },
            { label: 'Date', value: p.date ?? '—' },
            { label: 'Time', value: p.time ?? '—' },
          ].map((r) => (
            <View key={r.label} className="flex-row items-start justify-between gap-md">
              <Typography variant="body-md" color={theme.inkMuted}>
                {r.label}
              </Typography>
              <Typography variant="label-md" style={{ flex: 1, textAlign: 'right' }}>
                {r.value}
              </Typography>
            </View>
          ))}
        </View>
      </ConfirmModal>

      <CompleteBookingModal
        visible={completeOpen}
        onClose={() => {
          setCompleteOpen(false);
          setCompleteError(null);
        }}
        onConfirm={completeBooking}
        basePrice={basePrice}
        services={services}
        loading={completeM.isPending}
        error={completeError}
      />
    </Screen>
  );
}

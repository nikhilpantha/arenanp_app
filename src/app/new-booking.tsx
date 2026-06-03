import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  Button,
  Card,
  FormScreen,
  Icon,
  Input,
  NumberStepper,
  ScreenHeader,
  Segmented,
  TimeSelect,
  Typography,
} from '@/components/common';
import { FormInput, FormPhoneInput } from '@/components/form';
import { BookingPriceSummary } from '@/components/venue/bookings/BookingPriceSummary';
import { LoyaltyHintCard } from '@/components/venue/bookings/LoyaltyHintCard';
import { TeamPicker } from '@/components/venue/bookings/TeamPicker';
import { OfferSelect } from '@/components/venue/offers/OfferSelect';
import { VENUE_COURTS } from '@/data/bookings';
import { getCustomerByPhone } from '@/data/customers';
import { SPORTS_CATALOG } from '@/data/sports';
import { useTheme } from '@/hooks/use-theme';
import { type NewBookingFormValues, newBookingSchema } from '@/lib/booking-schemas';
import { useYupForm } from '@/lib/forms';
import { computeLoyalty } from '@/lib/loyalty';
import { applyOffer, type SubjectOfferEntry } from '@/lib/offers';
import { useOfferStore } from '@/stores';
import type { DayOfWeek, OfferSubjectType, PaymentMethod, PaymentStatus, SportType, Team } from '@/types';

type BookedBy = 'individual' | 'team';

const DOW: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function NewBookingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ sport?: string; court?: string; time?: string; price?: string }>();
  const redeemClaim = useOfferStore((s) => s.redeemClaim);

  const defaultCourt = VENUE_COURTS[0];
  const sport = (params.sport as SportType) ?? defaultCourt.sport;
  const court = params.court ?? defaultCourt.name;
  const unitPrice = params.price ? Number(params.price) : defaultCourt.pricePerSlot;
  const sportEntry = SPORTS_CATALOG.find((e) => e.sport === sport);

  const form = useYupForm<typeof newBookingSchema>({
    schema: newBookingSchema,
    defaultValues: { customerName: '', phone: '' },
  });

  const [bookedBy, setBookedBy] = useState<BookedBy>('individual');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [startTime, setStartTime] = useState(() => to24h(params.time) ?? '18:00');
  const [duration, setDuration] = useState(1);
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [amountPaid, setAmountPaid] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [offer, setOffer] = useState<SubjectOfferEntry | null>(null);

  // The loyalty subject: an individual by phone, or the selected team.
  const phone = form.watch('phone');
  const phoneReady = bookedBy === 'individual' && phone?.length === 10;
  const customer = phoneReady ? getCustomerByPhone(phone) : null;
  const isNewCustomer = Boolean(phoneReady && !customer);
  const individualLoyalty = customer ? computeLoyalty(customer.gamesPlayed) : null;
  const teamLoyalty = selectedTeam ? computeLoyalty(selectedTeam.totalGames) : null;

  const subjectType: OfferSubjectType = bookedBy === 'team' ? 'team' : 'customer';
  const subjectId = bookedBy === 'team' ? selectedTeam?.id : customer?.id;
  const subjectGames = bookedBy === 'team' ? (selectedTeam?.totalGames ?? 0) : (customer?.gamesPlayed ?? 0);

  // Drop the chosen offer whenever the subject changes (it may no longer apply) — the
  // "reset state on prop change during render" pattern, so no effect is needed.
  const subjectKey = `${bookedBy}:${subjectId ?? ''}`;
  const [prevSubjectKey, setPrevSubjectKey] = useState(subjectKey);
  if (subjectKey !== prevSubjectKey) {
    setPrevSubjectKey(subjectKey);
    setOffer(null);
  }

  // Pricing — an applied offer overrides any manual discount.
  const base = unitPrice * duration;
  const manualRaw = Number(discountValue) || 0;
  const manualDiscount = Math.min(
    base,
    discountType === 'percent' ? Math.round((base * manualRaw) / 100) : manualRaw,
  );
  const effect = applyOffer(offer?.offer ?? null, base);
  const isFree = effect.isFree;
  const discountAmt = offer ? effect.discountAmt : manualDiscount;
  const discountReasonLabel = offer ? offer.offer.title : discountReason;
  const total = isFree ? 0 : Math.max(0, base - discountAmt);
  const totalLabel = isFree ? 'Free' : `Rs ${total}`;

  // Payment tracking — partial captures what's collected now; the rest stays due.
  const paid = Math.min(total, Number(amountPaid) || 0);
  const remaining = Math.max(0, total - paid);
  const displayTime = to12h(startTime);

  const paymentLabel = isFree
    ? 'Free game'
    : paymentStatus === 'paid'
      ? `Paid · Rs ${total}`
      : paymentStatus === 'partial'
        ? `Partial · Rs ${paid} paid, Rs ${remaining} due`
        : `Pending · Rs ${total} due`;

  const finish = (who: string) => {
    // TODO(backend): persist booking + bump loyalty games. A claimed offer is consumed here.
    if (offer?.claim) redeemClaim(offer.claim.id);
    const offerLine = offer ? `\nOffer · ${offer.offer.title}` : '';
    Alert.alert('Booking confirmed', `${who} · ${court} · ${displayTime} · ${totalLabel}\n${paymentLabel}${offerLine}`, [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  const confirmIndividual = form.handleSubmit((v: NewBookingFormValues) => finish(v.customerName));

  const onConfirm = () => {
    if (bookedBy === 'individual') {
      confirmIndividual();
      return;
    }
    if (!selectedTeam) return Alert.alert('Select a team', 'Choose or add a team to book under.');
    return finish(selectedTeam.name);
  };

  return (
    <FormScreen
      scroll
      header={<ScreenHeader title="New booking" onBack={() => router.back()} />}
      footer={
        <Button size="lg" fullWidth className="rounded-full" rightIcon="check" onPress={onConfirm}>
          {`Confirm · ${totalLabel}`}
        </Button>
      }>
      {/* Slot summary */}
      <Card variant="muted" elevation="none" className="mt-md flex-row items-center gap-md">
        <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.card }}>
          <Typography variant="headline-md" style={{ textTransform: 'none' }}>
            {sportEntry?.emoji ?? '🏟️'}
          </Typography>
        </View>
        <View className="flex-1 gap-[2px]">
          <Typography variant="label-lg">
            {sportEntry?.label ?? sport} · {court}
          </Typography>
          <Typography variant="body-md" color={theme.inkMuted}>
            {displayTime} · Rs {unitPrice}/slot
          </Typography>
        </View>
      </Card>

      {/* Booked by */}
      <View className="gap-sm pt-lg">
        <Typography variant="label-md" color={theme.inkMuted}>
          Booked by
        </Typography>
        <Segmented
          options={[
            { value: 'individual', label: 'Individual' },
            { value: 'team', label: 'Team' },
          ]}
          value={bookedBy}
          onChange={(v) => setBookedBy(v as BookedBy)}
        />
      </View>

      {bookedBy === 'individual' ? (
        <>
          <View className="gap-md pt-lg">
            <FormInput
              control={form.control}
              name="customerName"
              label="Customer name"
              placeholder="Who's booking?"
              leftIcon="user"
              autoCapitalize="words"
            />
            <FormPhoneInput control={form.control} name="phone" label="Mobile number" />
          </View>

          {individualLoyalty || isNewCustomer ? (
            <View className="mt-md">
              <LoyaltyHintCard name={customer?.name} loyalty={individualLoyalty} isNew={isNewCustomer} />
            </View>
          ) : null}
        </>
      ) : (
        <View className="pt-lg">
          {selectedTeam ? (
            <View className="gap-sm">
              <Card elevation="sm" className="gap-md">
                <View className="flex-row items-center gap-md">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: theme.cardMuted }}>
                    <Icon name="users" size={22} color={theme.primary} />
                  </View>
                  <View className="flex-1">
                    <Typography variant="label-lg">{selectedTeam.name}</Typography>
                    <Typography variant="body-md" color={theme.inkMuted}>
                      {selectedTeam.members.length} members · {selectedTeam.totalGames} games
                    </Typography>
                  </View>
                  <Pressable onPress={() => setPickerVisible(true)} hitSlop={8}>
                    <Typography variant="label-md" color={theme.primary}>
                      Change
                    </Typography>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => router.push({ pathname: '/team/[id]', params: { id: selectedTeam.id } })}
                  className="flex-row items-center justify-between">
                  <Typography variant="label-md" color={theme.primary}>
                    View games & history
                  </Typography>
                  <Icon name="chevronRight" size={18} color={theme.primary} />
                </Pressable>
              </Card>

              {/* Team loyalty — tracked on the team's total games (no per-member roster). */}
              <LoyaltyHintCard name={selectedTeam.name} loyalty={teamLoyalty} />
            </View>
          ) : (
            <Pressable
              onPress={() => setPickerVisible(true)}
              className="items-center justify-center gap-sm rounded-3xl border-2 border-dashed py-xl"
              style={{ borderColor: theme.primary, backgroundColor: `${theme.primary}0D` }}>
              <View
                className="h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: `${theme.primary}1A` }}>
                <Icon name="users" size={26} color={theme.primary} />
              </View>
              <Typography variant="label-lg" color={theme.primary}>
                Select team
              </Typography>
              <Typography variant="body-md" color={theme.inkMuted}>
                Search an existing team or add a new one
              </Typography>
            </Pressable>
          )}
        </View>
      )}

      {/* Offers the subject can apply right now (loyalty / happy-hour / claimed promos). */}
      {subjectId ? (
        <OfferSelect
          subjectType={subjectType}
          subjectId={subjectId}
          games={subjectGames}
          sport={sport}
          day={DOW[new Date().getDay()]}
          hour={Number(startTime.split(':')[0])}
          selectedId={offer?.offer.id ?? null}
          onChange={setOffer}
        />
      ) : null}

      {/* Start time + duration */}
      <View className="pt-lg">
        <TimeSelect label="Start time" value={startTime} onChange={setStartTime} />
      </View>
      <View className="flex-row items-center justify-between pt-lg">
        <Typography variant="label-md" color={theme.inkMuted}>
          Duration (hours)
        </Typography>
        <NumberStepper value={duration} onChange={setDuration} min={1} max={6} />
      </View>

      {/* Discount — only when no offer is applied (the offer is the discount). */}
      {!offer && !isFree ? (
        <View className="gap-sm pt-lg">
          <Typography variant="label-md" color={theme.inkMuted}>
            Discount (optional)
          </Typography>
          <View className="flex-row gap-sm">
            <View style={{ width: 120 }}>
              <Segmented
                options={[
                  { value: 'percent', label: '%' },
                  { value: 'flat', label: 'Rs' },
                ]}
                value={discountType}
                onChange={(v) => setDiscountType(v as 'percent' | 'flat')}
              />
            </View>
            <View className="flex-1">
              <Input
                value={discountValue}
                onChangeText={setDiscountValue}
                placeholder={discountType === 'percent' ? 'e.g. 10' : 'e.g. 200'}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <Input value={discountReason} onChangeText={setDiscountReason} placeholder="Reason (optional)" />
        </View>
      ) : null}

      {/* Payment — status (full / partial / pending) + method, so dues are tracked. */}
      {!isFree ? (
        <View className="gap-sm pt-lg">
          <Typography variant="label-md" color={theme.inkMuted}>
            Payment status
          </Typography>
          <Segmented
            options={[
              { value: 'paid', label: 'Paid' },
              { value: 'partial', label: 'Partial' },
              { value: 'pending', label: 'Pending' },
            ]}
            value={paymentStatus}
            onChange={(v) => setPaymentStatus(v as PaymentStatus)}
          />

          {paymentStatus === 'partial' ? (
            <View className="gap-xs pt-sm">
              <Input
                value={amountPaid}
                onChangeText={setAmountPaid}
                placeholder={`Amount paid now (e.g. ${Math.round(total / 2)})`}
                keyboardType="number-pad"
              />
              <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
                Rs {paid} paid · Rs {remaining} remaining
              </Typography>
            </View>
          ) : null}

          {paymentStatus !== 'pending' ? (
            <View className="gap-sm pt-sm">
              <Typography variant="label-md" color={theme.inkMuted}>
                Payment method
              </Typography>
              <Segmented
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'esewa', label: 'eSewa' },
                  { value: 'khalti', label: 'Khalti' },
                  { value: 'card', label: 'Card' },
                ]}
                value={method}
                onChange={(v) => setMethod(v as PaymentMethod)}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Price summary */}
      <BookingPriceSummary
        duration={duration}
        base={base}
        discountAmt={discountAmt}
        discountReason={discountReasonLabel}
        isFree={isFree}
        totalLabel={totalLabel}
      />

      <TeamPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={setSelectedTeam}
        onAddTeam={() => router.push('/team/new')}
      />
    </FormScreen>
  );
}

/** "6:00 PM" / "6 PM" → "18:00" (TimeSelect's 24h value). Returns null if unparseable. */
function to24h(label?: string): string | null {
  const m = label?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ?? '00';
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

/** "18:00" → "6:00 PM" for display. */
function to12h(value: string): string {
  const [hStr, min] = value.split(':');
  const h24 = Number(hStr);
  const ap = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${min} ${ap}`;
}

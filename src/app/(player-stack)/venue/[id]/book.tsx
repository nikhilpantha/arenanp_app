import { useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  FormScreen,
  InlineLoader,
  ScreenHeader,
  Segmented,
  Typography,
} from '@/components/common';
import { BookingSummary } from '@/components/player/venues/booking/BookingSummary';
import { CourtChoice } from '@/components/player/venues/booking/CourtChoice';
import { MembershipSlotPicker } from '@/components/player/venues/booking/membership/MembershipSlotPicker';
import { MembershipSummary } from '@/components/player/venues/booking/membership/MembershipSummary';
import { PlanChoice } from '@/components/player/venues/booking/membership/PlanChoice';
import { OfferPicker } from '@/components/player/venues/booking/OfferPicker';
import { SlotPicker } from '@/components/player/venues/booking/SlotPicker';
import { usePlayerBooking } from '@/components/player/venues/booking/use-player-booking';
import { usePlayerMembership } from '@/components/player/venues/booking/use-player-membership';
import { BookingReviewModal } from '@/components/venue/bookings/new-booking/BookingReviewModal';
import { useTheme } from '@/hooks/use-theme';

const MODES = [
  { value: 'normal', label: 'Book a court' },
  { value: 'membership', label: 'Membership' },
];

export default function VenueBookScreen() {
  const b = usePlayerBooking();
  const m = usePlayerMembership();
  const [mode, setMode] = useState('normal');
  const theme = useTheme();

  const header = <ScreenHeader title="Book Now" onBack={() => b.router.back()} />;

  if (b.loading) {
    return (
      <FormScreen header={header}>
        <InlineLoader paddingVertical={64} />
      </FormScreen>
    );
  }

  const membership = mode === 'membership';

  return (
    <FormScreen
      scroll
      header={header}
      footer={
        <View className="gap-sm">
          {(membership ? m.errors : b.errors).length > 0 ? (
            <View
              className="gap-xs rounded-xl px-md py-sm"
              style={{ backgroundColor: `${theme.danger}14` }}>
              {(membership ? m.errors : b.errors).map((msg) => (
                <Typography
                  key={msg}
                  variant="body-sm"
                  color={theme.danger}
                  style={{ textTransform: 'none' }}>
                  • {msg}
                </Typography>
              ))}
            </View>
          ) : null}
          <Button
            size="lg"
            fullWidth
            className="rounded-full"
            rightIcon="arrowRight"
            onPress={membership ? m.onSubmit : b.onSubmit}>
            {membership
              ? `Subscribe${m.plan ? ` · ${m.totalLabel}` : ''}`
              : `Book${b.price.total > 0 ? ` · ${b.price.totalLabel}` : ''}`}
          </Button>
        </View>
      }>
      <View className="gap-xl">
        {/* Normal booking is the default + priority; switch to buy a membership. */}
        <Segmented options={MODES} value={mode} onChange={setMode} />

        {membership ? (
          <>
            <PlanChoice plans={m.plans} selectedId={m.plan?.id} onSelect={m.onPlan} />
            {m.plan ? (
              <MembershipSlotPicker
                courts={m.courts}
                courtId={m.courtId}
                onCourt={m.onCourt}
                date={m.date}
                onDate={m.setDate}
                slots={m.slots}
                slotStart={m.slotStart}
                onSlot={m.setSlotStart}
                loading={m.slotsLoading}
                noneFree={m.noneFree}
              />
            ) : null}
            {m.plan ? <MembershipSummary plan={m.plan} date={m.date} /> : null}
          </>
        ) : (
          <>
            <CourtChoice courts={b.courts} selectedId={b.courtId} onSelect={b.setCourt} />
            <SlotPicker
              date={b.when.date}
              onDate={b.when.setDate}
              durationSlots={b.when.durationSlots}
              onDuration={b.when.setDuration}
              maxSlots={b.when.maxSlots}
              formatDuration={b.when.formatDuration}
              slots={b.when.slots}
              startValue={b.when.startValue}
              onStart={b.when.setStartValue}
              loading={b.when.loading}
              hasCourt={b.when.hasCourt}
            />
            <OfferPicker
              offers={b.offers.list}
              selected={b.offers.selected}
              onSelect={b.offers.onSelect}
              code={b.offers.code}
              onCode={b.offers.setCode}
              subtotal={b.price.base}
            />
            <BookingSummary
              base={b.price.base}
              discount={b.price.discount}
              total={b.price.total}
              durationLabel={b.when.durationLabel}
            />
          </>
        )}
      </View>

      <BookingReviewModal
        visible={membership ? m.confirm.open : b.confirm.open}
        onClose={membership ? m.confirm.close : b.confirm.close}
        onConfirm={membership ? m.confirm.submit : b.confirm.submit}
        loading={membership ? m.confirm.loading : b.confirm.loading}
        error={membership ? m.confirm.error : b.confirm.error}
        rows={membership ? m.confirm.rows : b.confirm.rows}
        totalLabel={membership ? m.confirm.totalLabel : b.confirm.totalLabel}
      />
    </FormScreen>
  );
}

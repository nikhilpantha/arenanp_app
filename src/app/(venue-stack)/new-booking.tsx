import { Button, FormScreen, ScreenHeader } from '@/components/common';
import { BookingPriceSummary } from '@/components/venue/bookings/BookingPriceSummary';
import { CustomerPicker } from '@/components/venue/bookings/CustomerPicker';
import { BookingReviewModal } from '@/components/venue/bookings/new-booking/BookingReviewModal';
import { CourtPicker } from '@/components/venue/bookings/new-booking/CourtPicker';
import { CourtSummaryCard } from '@/components/venue/bookings/new-booking/CourtSummaryCard';
import { CustomerSection } from '@/components/venue/bookings/new-booking/CustomerSection';
import { FreeGameToggle } from '@/components/venue/bookings/new-booking/FreeGameToggle';
import { PaymentSection } from '@/components/venue/bookings/new-booking/PaymentSection';
import { useNewBooking } from '@/components/venue/bookings/new-booking/use-new-booking';
import { WhenSection } from '@/components/venue/bookings/new-booking/WhenSection';
import { OfferSelect } from '@/components/venue/offers/OfferSelect';

export default function NewBookingScreen() {
  const b = useNewBooking();

  return (
    <FormScreen
      scroll
      header={<ScreenHeader title="New booking" onBack={() => b.router.back()} />}
      footer={
        <Button
          size="lg"
          fullWidth
          className="rounded-full"
          rightIcon="check"
          disabled={!b.hasCourt || !b.timeValid}
          onPress={b.onConfirm}>
          {!b.hasCourt ? 'Select a court' : b.timeValid ? `Confirm · ${b.totalLabel}` : 'Pick an available time'}
        </Button>
      }>
      <CourtSummaryCard {...b.summary} />

      {b.apiEnabled ? (
        <CourtPicker
          courts={b.courtPicker.courts}
          selectedId={b.courtPicker.effectiveCourtId}
          onSelect={b.courtPicker.onSelect}
        />
      ) : null}

      <CustomerSection
        customer={b.customer.selectedCustomer}
        loyalty={b.customer.loyalty}
        isNew={b.customer.isNew}
        onOpenPicker={b.customer.open}
      />

      {b.freeGame.ready ? <FreeGameToggle active={b.freeGame.active} onToggle={b.freeGame.toggle} /> : null}

      {b.offers.show ? (
        <OfferSelect
          subjectType="customer"
          subjectId={b.offers.subjectId}
          games={b.offers.games}
          sport={b.offers.sport}
          day={b.offers.day}
          hour={b.offers.hour}
          selectedId={b.offers.selectedId}
          onChange={b.offers.onChange}
        />
      ) : null}

      <WhenSection
        date={b.when.date}
        onDate={b.when.setDate}
        duration={b.when.duration}
        onDuration={b.when.setDuration}
        startTime={b.when.startTime}
        onStartTime={b.when.setStartTime}
        openSlots={b.when.openSlots}
      />

      {b.payment.show ? (
        <PaymentSection
          status={b.payment.status}
          onStatus={b.payment.setStatus}
          amountPaid={b.payment.amountPaid}
          onAmountPaid={b.payment.setAmountPaid}
          method={b.payment.method}
          onMethod={b.payment.setMethod}
          paid={b.payment.paid}
          remaining={b.payment.remaining}
          total={b.payment.total}
        />
      ) : null}

      <BookingPriceSummary
        duration={b.price.duration}
        base={b.price.base}
        discountAmt={b.price.discountAmt}
        discountReason={b.price.discountReason}
        isFree={b.price.isFree}
        totalLabel={b.price.totalLabel}
      />

      <CustomerPicker
        visible={b.customer.pickerVisible}
        onClose={b.customer.close}
        onSelect={b.customer.pick}
      />

      <BookingReviewModal
        visible={b.confirm.open}
        onClose={b.confirm.close}
        onConfirm={b.confirm.submit}
        loading={b.confirm.loading}
        error={b.confirm.error}
        rows={b.confirm.rows}
        totalLabel={b.confirm.totalLabel}
      />
    </FormScreen>
  );
}

import { getCustomerByPhone } from '@/data/customers';
import { useSubjectLoyalty } from '@/lib/api/venue-customers';
import { computeLoyalty, type LoyaltyState } from '@/lib/loyalty';

import { toLoyaltyState } from './new-booking.helpers';

export interface CustomerLoyalty {
  loyalty: LoyaltyState | null;
  isNew: boolean;
  freeGameReady: boolean;
  gamesPlayed: number;
}

/**
 * Loyalty for the selected customer. Live (keyed by customer id) when the API is
 * configured; falls back to the mock catalogue (keyed by phone) in dev.
 */
export function useCustomerLoyalty(opts: {
  apiEnabled: boolean;
  customerId?: string;
  hasCustomer: boolean;
  phone?: string;
}): CustomerLoyalty {
  const { apiEnabled, customerId, hasCustomer, phone } = opts;
  const apiLoyalty = useSubjectLoyalty({ customerId }).data;
  const mock = !apiEnabled && phone?.length === 10 ? getCustomerByPhone(phone) : null;

  if (apiEnabled) {
    return {
      loyalty: toLoyaltyState(apiLoyalty),
      isNew: Boolean(hasCustomer && apiLoyalty && apiLoyalty.gamesPlayed === 0),
      freeGameReady: Boolean(apiLoyalty?.ready),
      gamesPlayed: apiLoyalty?.gamesPlayed ?? 0,
    };
  }
  return {
    loyalty: mock ? computeLoyalty(mock.gamesPlayed) : null,
    isNew: Boolean(mock === null && hasCustomer),
    freeGameReady: false,
    gamesPlayed: mock?.gamesPlayed ?? 0,
  };
}

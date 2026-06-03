import type { IconName } from '@/components/common';

export type Period = 'today' | 'week' | 'month';

// TODO(backend): replace with the earnings/payouts API.
export const BALANCE: Record<Period, string> = {
  today: 'Rs 8,400',
  week: 'Rs 62,300',
  month: 'Rs 2,48,900',
};

export const PERIOD_LABEL: Record<Period, { long: string; short: string }> = {
  today: { long: 'Today', short: 'Today' },
  week: { long: 'This week', short: 'Week' },
  month: { long: 'This month', short: 'Month' },
};

export interface Txn {
  id: string;
  title: string;
  sub: string;
  amount: string;
  icon: IconName;
}

export const TRANSACTIONS: Txn[] = [
  { id: '1', title: 'Court 1 · Futsal', sub: 'Ramesh K. · Cash', amount: '+ Rs 1,200', icon: 'activity' },
  { id: '2', title: 'Court 2 · Basketball', sub: 'Sita M. · eSewa', amount: '+ Rs 900', icon: 'trophy' },
  { id: '3', title: 'Monthly membership', sub: 'Arjun T. · Khalti', amount: '+ Rs 4,000', icon: 'award' },
  { id: '4', title: 'Payout to bank', sub: 'NIC Asia · ****1234', amount: '− Rs 40,000', icon: 'creditCard' },
];

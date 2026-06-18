import type { IconName } from '@/components/common';
import type { VenueEditSection } from '@/lib/venue-edit';

export interface ProfileRowItem {
  key: string;
  title: string;
  subtitle: string;
  icon: IconName;
  /** When set, the row opens the matching venue-edit section. */
  section?: VenueEditSection;
  /** When set, the row navigates straight to this route (takes precedence). */
  href?: '/offers' | '/memberships' | '/closures';
}

// Mirrors the onboarding steps so each row reuses that step's editor.
export const MANAGE_ROWS: ProfileRowItem[] = [
  { key: 'basics', title: 'Photos & basics', subtitle: 'Name, description & contact', icon: 'building', section: 'basics' },
  { key: 'location', title: 'Location', subtitle: 'Map pin and address', icon: 'mapPin', section: 'location' },
  { key: 'services', title: 'Sports & pricing', subtitle: 'Courts, slots & rates', icon: 'activity', section: 'services' },
  { key: 'hours', title: 'Hours & extras', subtitle: 'Booking hours & add-on services', icon: 'clock', section: 'hours' },
  { key: 'offers', title: 'Offers & loyalty', subtitle: 'Discounts, happy hours & rewards', icon: 'percent', href: '/offers' },
  { key: 'memberships', title: 'Memberships', subtitle: 'Plans & subscribed members', icon: 'repeat', href: '/memberships' },
  { key: 'closures', title: 'Closures & blocks', subtitle: 'Close the venue or block a court', icon: 'calendar', href: '/closures' },
  { key: 'verification', title: 'Verification', subtitle: 'Earn a Verified badge', icon: 'shield', section: 'verification' },
];

export const ACCOUNT_ROWS: ProfileRowItem[] = [
  { key: 'account', title: 'Account details', subtitle: 'Name and phone', icon: 'user' },
  { key: 'notifications', title: 'Notifications', subtitle: 'Alerts and reminders', icon: 'bell' },
  { key: 'payments', title: 'Payment methods', subtitle: 'Payouts and accounts', icon: 'creditCard' },
  { key: 'support', title: 'Help & support', subtitle: 'Get help or report an issue', icon: 'helpCircle' },
];

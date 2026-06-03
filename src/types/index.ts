export interface Venue {
  id: string;
  name: string;
  location: string;
  sport: string;
  pricePerHour: number;
  rating?: number;
  imageUrl?: string;
}

/** A sport an owner's venue offers, plus features, court count and hourly price. */
export interface VenueSportConfig {
  sport: SportType;
  features: string[];
  courts: number;
  pricePerHour: number; // NPR
}

/** A sport/service offered by a venue, with its courts, slot length and price. */
export interface VenueServiceDraft {
  sport: SportType;
  features: string[];
  courts: number;
  slotMinutes: number; // slot length, e.g. 60
  pricePerSlot: number; // NPR per slot
}

/** An extra amenity/service a venue provides; `price` omitted/0 = free. */
export interface AdditionalService {
  name: string;
  price?: number; // NPR
}

/** Optional verification documents; providing any flags the venue as verified. */
export interface VenueVerification {
  panNumber?: string;
  panDoc?: string; // image URI
  businessRegDoc?: string; // image URI
  citizenshipDoc?: string; // image URI
}

/**
 * Venue details collected during owner onboarding. Frontend-only for now — photos and
 * documents are device URIs; persisting/uploading is the backend's job (TODO).
 */
export interface VenueDraft {
  photos: string[]; // device URIs; first = cover
  venueName: string;
  description?: string;
  venuePhone: string; // E.164
  contactPhone?: string; // E.164, optional alternate
  address: string;
  latitude: number;
  longitude: number;
  services: VenueServiceDraft[];
  additionalServices: AdditionalService[];
  openTime: string; // "06:00"
  closeTime: string; // "22:00"
  verification?: VenueVerification;
  verified: boolean; // derived: true once any verification doc is provided
}

/** A persisted venue row owned by an owner account. */
export interface OwnerVenue extends VenueDraft {
  id: string;
  ownerId: string;
  createdAt: string;
}

export interface League {
  id: string;
  name: string;
  sport: string;
  startsAt: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startsAt: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
}

export type UserRole = 'player' | 'owner';

export interface Profile {
  id: string;
  role?: UserRole; // undefined until the user picks a role after phone verification
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  email?: string;
}

export interface Owner {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface VenueOwned {
  id: string;
  name: string;
  location: string;
}

export type SlotStatus = 'available' | 'walkin' | 'online' | 'subscription' | 'maintenance';

export type SportType =
  | 'futsal'
  | 'football'
  | 'cricket'
  | 'indoor-cricket'
  | 'volleyball'
  | 'basketball'
  | 'badminton'
  | 'tennis';
export type PaymentMethod = 'cash' | 'card' | 'esewa' | 'khalti';
export type BookingType = 'walkin' | 'online' | 'subscription';
export type BlockReason = 'maintenance' | 'private-event' | 'holiday';

/** Where a booking sits in its operational lifecycle (drives the Today/Upcoming lists). */
export type BookingStatus = 'upcoming' | 'checked-in' | 'completed' | 'no-show' | 'cancelled';

/** Payment state of a booking — online bookings can be partially paid. */
export type PaymentStatus = 'paid' | 'pending' | 'partial';

/** Who holds a booking — a registered team, a walk-in individual, or a club. */
export type CustomerType = 'team' | 'individual' | 'club';

/** A concrete court booking the owner manages from the Bookings screen. */
export interface VenueBooking {
  id: string;
  customer: string;
  customerType: CustomerType;
  phone?: string; // 10-digit local — the loyalty card + contact number
  sport: SportType;
  court: string;
  date: string; // ISO yyyy-mm-dd
  startLabel: string; // e.g. "4 PM"
  endLabel: string; // e.g. "5 PM"
  status: BookingStatus;
  payment: PaymentStatus;
  amount: number; // NPR; 0 when redeemed as a free loyalty game
  freeGame?: boolean;
}

export type RecurringStatus = 'active' | 'paused' | 'expired';

/** A recurring subscription slot — the venue's monthly-package business. */
export interface RecurringBooking {
  id: string;
  customer: string;
  sport: SportType;
  court: string;
  cadence: string; // e.g. "Every Sunday"
  timeLabel: string; // e.g. "6 PM - 7 PM"
  packageName: string; // e.g. "Monthly Package"
  status: RecurringStatus;
  remainingSessions: number;
  totalSessions: number;
  nextSession: string; // display, e.g. "Jun 8" (— when paused)
  packageAmount: number; // NPR
  renewalDate: string; // display, e.g. "Jun 30"
}

export interface Slot {
  id: string;
  time: string;
  court: string;
  status: SlotStatus;
  customerName?: string;
}

/** A manual discount applied to a booking. */
export interface Discount {
  type: 'percent' | 'flat';
  value: number;
  reason?: string;
}

export interface Booking {
  id: string;
  court: string;
  date: string;
  startHour: number;
  durationHours: number;
  status: SlotStatus;
  customerName?: string;
  sport?: SportType;
  paymentMethod?: PaymentMethod;
  notes?: string;
  reason?: BlockReason;
  discount?: Discount;
  originalPrice?: number;
  finalPrice?: number;
  loyaltyFree?: boolean;
}

/** A repeat customer, tracked for the loyalty reward (every Nth game free). */
export interface Customer {
  id: string;
  name: string;
  phone: string; // 10-digit local
  gamesPlayed: number;
  freeGamesUsed?: number;
  // Insight fields shown on the booking detail screen (TODO(backend): from the bookings API).
  totalRevenue?: number; // NPR lifetime spend
  lastPlayed?: string; // display, e.g. "2 days ago"
  preferredSlot?: string; // display, e.g. "6 PM"
}

/** A member of a team; games tracked per person for loyalty + history. */
export interface TeamMember {
  id: string;
  name: string;
  phone?: string; // 10-digit local, optional
  gamesPlayed: number;
}

/** A past game played by a team (for its history). */
export interface TeamGame {
  id: string;
  date: string; // display, e.g. "12 May"
  sport: SportType;
  court: string;
  result?: string; // optional, e.g. "Won 3–2"
}

/** A reusable team an owner can book under (and track each member's plays). */
export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  totalGames: number;
  history: TeamGame[];
}

export interface LoyaltyConfig {
  freeAfter: number; // free game after every N paid games
}

// ── Offers / promotions ──────────────────────────────────────────────────────
// A venue offer is a reward + a trigger + a scope. The loyalty punch-card is just
// one offer (reward: free-game, trigger: every-nth). Visuals are derived from the
// reward at render time (see components/venue/offers/offer-visual), not stored.

/** What the customer gets. */
export type OfferRewardKind = 'free-game' | 'percent' | 'flat';
/** How they qualify. */
export type OfferTriggerKind = 'every-nth' | 'happy-hour' | 'manual';
/** Who the offer is for. */
export type OfferAudience = 'all' | 'individual' | 'team' | 'member';
export type OfferStatus = 'active' | 'paused' | 'expired';

export interface Offer {
  id: string;
  title: string;
  description?: string;
  reward: OfferRewardKind;
  rewardValue?: number; // percent (0–100) or NPR; omitted for free-game
  trigger: OfferTriggerKind;
  everyGames?: number; // every-nth: reward on every Nth game
  days?: DayOfWeek[]; // happy-hour: qualifying days
  startHour?: number; // happy-hour: 0–23
  endHour?: number; // happy-hour: 0–23
  audience: OfferAudience;
  sports?: SportType[]; // undefined/empty = all sports
  status: OfferStatus;
}

export type OfferSubjectType = 'customer' | 'team';
export type OfferClaimStatus = 'available' | 'redeemed' | 'expired';

/** A manual offer granted to a customer/team, redeemed at their next booking. */
export interface OfferClaim {
  id: string;
  offerId: string;
  subjectType: OfferSubjectType;
  subjectId: string;
  status: OfferClaimStatus;
  claimedAt: string; // ISO yyyy-mm-dd
  redeemedAt?: string;
}

/** A pending online booking awaiting the owner's accept/decline. */
export interface BookingRequest {
  id: string;
  customerName: string;
  phone: string;
  sport: SportType;
  court: string;
  time: string; // display, e.g. "5:00 PM"
  date: string;
  durationHours: number;
  price: number; // NPR
  requestedAt: string; // relative, e.g. "5m ago"
}

export interface BookingFormValues {
  customerName: string;
  sport: SportType;
  durationHours: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  court: string;
  startHour: number;
}

export interface InventoryFilters {
  sport?: SportType;
  bookingType?: BookingType;
  status?: SlotStatus;
}

export interface LiveStatus {
  courtsTotal: number;
  courtsOccupied: number;
  activeMatches: number;
  todayBookings: number;
}

export interface RevenueSnapshot {
  today: number;
  thisWeek: number;
  pending: number;
  sparkline: readonly number[];
}

export type ActivityType = 'booking' | 'membership' | 'cancel' | 'payment';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  timestamp: string;
}

export type MembershipDuration = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  duration: MembershipDuration;
  startHour: number;
  endHour: number;
  daysOfWeek: readonly DayOfWeek[];
  validityDays: number;
  sportsIncluded: readonly SportType[];
  accent: string;
  highlight?: string;
  description?: string;
}

export interface MembershipTierFormValues {
  name: string;
  startHour: number;
  endHour: number;
  duration: MembershipDuration;
  price: number;
  sportsIncluded: SportType[];
  daysOfWeek: DayOfWeek[];
}

export type MemberStatus = 'active' | 'expiring' | 'expired';

export interface RenewalRecord {
  id: string;
  date: string;
  amount: number;
  duration: MembershipDuration;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  status: 'paid' | 'pending' | 'failed';
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  tierId: string;
  status: MemberStatus;
  joinedAt: string;
  expiresAt: string;
  remainingSessions: number;
  totalSessions: number;
  renewals: readonly RenewalRecord[];
  payments: readonly PaymentRecord[];
}

export interface MembershipStats {
  activeMembers: number;
  expiringSoon: number;
  monthlyRevenue: number;
  renewalRatePct: number;
}

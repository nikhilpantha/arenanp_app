/**
 * GraphQL documents for the auth + identity surface. Plain strings (no `gql`
 * tag) so we don't need the `graphql` package at runtime. Field selections
 * mirror the backend `schema.gql`.
 */

const USER_FIELDS = `
  id
  fullName
  phoneNumber
  email
  avatarUrl
  role
  venueStatus
  organizerStatus
  capabilities {
    type
    status
  }
`;

// Per-role sign-up / sign-in. The role is fixed by the mutation (server-side);
// `password` is optional (set on first sign-up). `roleAdded` is true when this
// call granted a role the account didn't have yet.
const OTP_RESULT_FIELDS = `
  phoneNumber
  expiresInSeconds
  resendAvailableInSeconds
  devCode
  roleAdded
`;

export const REQUEST_PLAYER_OTP = /* GraphQL */ `
  mutation RequestPlayerOtp($input: RequestOtpInput!) {
    requestPlayerOtp(input: $input) { ${OTP_RESULT_FIELDS} }
  }
`;

export const REQUEST_VENUE_OTP = /* GraphQL */ `
  mutation RequestVenueOtp($input: RequestOtpInput!) {
    requestVenueOtp(input: $input) { ${OTP_RESULT_FIELDS} }
  }
`;

export const LOGIN_WITH_PHONE = /* GraphQL */ `
  mutation LoginWithPhone($input: LoginWithPhoneInput!) {
    loginWithPhone(input: $input) {
      accessToken
      tokenType
      expiresAt
      user { ${USER_FIELDS} }
    }
  }
`;

export const VERIFY_OTP = /* GraphQL */ `
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      accessToken
      tokenType
      expiresAt
      user { ${USER_FIELDS} }
    }
  }
`;

export const SIGN_OUT = /* GraphQL */ `
  mutation SignOut {
    signOut
  }
`;

export const ME = /* GraphQL */ `
  query Me {
    me { ${USER_FIELDS} }
  }
`;

// ── Sports catalogue (admin-managed; app reads it dynamically) ───────────────

export const SPORTS = /* GraphQL */ `
  query Sports {
    sports {
      id
      slug
      name
      iconUrl
      description
      features
      slotDurations
      displayOrder
    }
  }
`;

export interface ApiSport {
  id: string;
  slug: string;
  name: string;
  /** Presigned download URL (null when no icon uploaded). */
  iconUrl: string | null;
  description: string | null;
  /** Amenity presets to offer for this sport. */
  features: string[];
  /** Allowed booking slot lengths (minutes) for this sport. */
  slotDurations: number[];
  displayOrder: number;
}

const MEMBERSHIP_FIELDS = `
  venueId
  venueName
  role
  permissions
  status
  verificationStatus
`;

/** One round-trip: the user + their venue memberships. Drives panels + permission gating. */
export const IDENTITY = /* GraphQL */ `
  query Identity {
    me { ${USER_FIELDS} }
    myVenueMemberships { ${MEMBERSHIP_FIELDS} }
  }
`;

export const SUBMIT_VENUE = /* GraphQL */ `
  mutation SubmitVenue($input: SubmitVenueInput!) {
    submitVenue(input: $input) {
      id
      name
      verificationStatus
    }
  }
`;

export const UPDATE_PROFILE = /* GraphQL */ `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) { ${USER_FIELDS} }
  }
`;

// ── Media uploads (presigned S3) ─────────────────────────────────────────────

/**
 * Ask the backend for a presigned URL to upload one file straight to S3. The
 * returned `key` is what gets persisted (in avatarUrl / imageUrls / documentUrls);
 * `uploadUrl` is PUT-ed to with the matching `contentType` header.
 */
export const CREATE_UPLOAD_URL = /* GraphQL */ `
  mutation CreateUploadUrl($input: CreateUploadUrlInput!) {
    createUploadUrl(input: $input) {
      key
      uploadUrl
      method
      contentType
      expiresIn
      maxBytes
    }
  }
`;

/** Resolve a stored object key into a fresh presigned download URL (for previews). */
export const MEDIA_URL = /* GraphQL */ `
  query MediaUrl($key: String!) {
    mediaUrl(key: $key)
  }
`;

// ── Venue bookings ───────────────────────────────────────────────────────────

const BOOKING_FIELDS = `
  id
  courtId
  courtName
  sport { slug name }
  customerName
  customerPhone
  customerType
  source
  startAt
  endAt
  durationMinutes
  status
  paymentStatus
  amountPaid
  subtotal
  discountAmount
  extras { id name price }
  extrasTotal
  total
  freeGame
  createdAt
`;

export const VENUE_BOOKINGS = /* GraphQL */ `
  query VenueBookings($input: ListVenueBookingsInput!) {
    venueBookings(input: $input) { ${BOOKING_FIELDS} }
  }
`;

export const VENUE_BOOKING_SUMMARY = /* GraphQL */ `
  query VenueBookingSummary($venueId: ID!) {
    venueBookingSummary(venueId: $venueId) {
      bookingsToday
      revenueToday
      pendingPayments
    }
  }
`;

export const SET_VENUE_BOOKING_STATUS = /* GraphQL */ `
  mutation SetVenueBookingStatus($input: SetBookingStatusInput!) {
    setVenueBookingStatus(input: $input) { id status }
  }
`;

export const CREATE_VENUE_BOOKING = /* GraphQL */ `
  mutation CreateVenueBooking($input: CreateVenueBookingInput!) {
    createVenueBooking(input: $input) { ${BOOKING_FIELDS} }
  }
`;

/** A single booking by id (used to prefill the edit form). */
export const VENUE_BOOKING = /* GraphQL */ `
  query VenueBooking($venueId: ID!, $bookingId: ID!) {
    venueBooking(venueId: $venueId, bookingId: $bookingId) { ${BOOKING_FIELDS} }
  }
`;

/** Edit a pending booking — reschedule and/or change the customer. */
export const UPDATE_VENUE_BOOKING = /* GraphQL */ `
  mutation UpdateVenueBooking($input: UpdateVenueBookingInput!) {
    updateVenueBooking(input: $input) { ${BOOKING_FIELDS} }
  }
`;

export const COMPLETE_VENUE_BOOKING = /* GraphQL */ `
  mutation CompleteVenueBooking($input: CompleteVenueBookingInput!) {
    completeVenueBooking(input: $input) { ${BOOKING_FIELDS} }
  }
`;

// ── Online booking requests (player books → venue accepts / declines) ─────────

export const ACCEPT_VENUE_BOOKING = /* GraphQL */ `
  mutation AcceptVenueBooking($input: AcceptVenueBookingInput!) {
    acceptVenueBooking(input: $input) { id status }
  }
`;

export const DECLINE_VENUE_BOOKING = /* GraphQL */ `
  mutation DeclineVenueBooking($input: DeclineVenueBookingInput!) {
    declineVenueBooking(input: $input) { id status }
  }
`;

// ── Venue offers (discounts + loyalty rewards) ───────────────────────────────

export type ApiOfferDiscountType = 'PERCENT' | 'FLAT' | 'FREE_GAME';
export type ApiOfferTrigger = 'PROMO_CODE' | 'EVERY_NTH';
export type ApiOfferAudience = 'ALL' | 'INDIVIDUAL' | 'TEAM';

const OFFER_FIELDS = `
  id
  venueId
  title
  description
  discountType
  discountValue
  maxDiscount
  minSubtotal
  trigger
  audience
  everyGames
  code
  validFrom
  validUntil
  isActive
  usageLimit
  usageCount
  createdAt
`;

export interface ApiOffer {
  id: string;
  venueId: string;
  title: string;
  description: string | null;
  discountType: ApiOfferDiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minSubtotal: number;
  trigger: ApiOfferTrigger;
  audience: ApiOfferAudience;
  everyGames: number | null;
  code: string | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usageLimit: number | null;
  usageCount: number;
  createdAt: string;
}

/** All offers for a venue (management view), paginated. */
export const VENUE_OFFERS = /* GraphQL */ `
  query VenueOffers($input: ListVenueOffersInput!) {
    venueOffers(input: $input) {
      items { ${OFFER_FIELDS} }
      pageInfo { totalItems }
    }
  }
`;

export const CREATE_OFFER = /* GraphQL */ `
  mutation CreateOffer($input: CreateOfferInput!) {
    createOffer(input: $input) { ${OFFER_FIELDS} }
  }
`;

export const UPDATE_OFFER = /* GraphQL */ `
  mutation UpdateOffer($input: UpdateOfferInput!) {
    updateOffer(input: $input) { ${OFFER_FIELDS} }
  }
`;

export const DELETE_VENUE_OFFER = /* GraphQL */ `
  mutation DeleteVenueOffer($venueId: ID!, $offerId: ID!) {
    deleteVenueOffer(venueId: $venueId, offerId: $offerId) { id }
  }
`;

// ── Venue closures (court / whole-venue time blocks) ─────────────────────────

export interface ApiClosure {
  id: string;
  venueId: string;
  courtId: string | null;
  startAt: string;
  endAt: string;
  reason: string | null;
  createdAt: string;
}

const CLOSURE_FIELDS = `
  id
  venueId
  courtId
  startAt
  endAt
  reason
  createdAt
`;

export const VENUE_CLOSURES = /* GraphQL */ `
  query VenueClosures($input: ListClosuresInput!) {
    venueClosures(input: $input) { ${CLOSURE_FIELDS} }
  }
`;

export const CREATE_CLOSURE = /* GraphQL */ `
  mutation CreateClosure($input: CreateClosureInput!) {
    createClosure(input: $input) { ${CLOSURE_FIELDS} }
  }
`;

export const DELETE_CLOSURE = /* GraphQL */ `
  mutation DeleteClosure($venueId: ID!, $closureId: ID!) {
    deleteClosure(venueId: $venueId, closureId: $closureId) { id }
  }
`;

// ── Venue customers (people and teams, one table) ────────────────────────────

const CUSTOMER_FIELDS = `
  id
  name
  phone
  notes
  gamesPlayed
  freeGameReady
  createdAt
`;

export const VENUE_CUSTOMERS = /* GraphQL */ `
  query VenueCustomers($input: ListVenueCustomersInput!) {
    venueCustomers(input: $input) { ${CUSTOMER_FIELDS} }
  }
`;

export const VENUE_CUSTOMER = /* GraphQL */ `
  query VenueCustomer($venueId: ID!, $customerId: ID!) {
    venueCustomer(venueId: $venueId, customerId: $customerId) { ${CUSTOMER_FIELDS} }
  }
`;

export const CREATE_VENUE_CUSTOMER = /* GraphQL */ `
  mutation CreateVenueCustomer($input: CreateVenueCustomerInput!) {
    createVenueCustomer(input: $input) { ${CUSTOMER_FIELDS} }
  }
`;

/** A customer's bookings (most recent first) for the detail history. */
export const VENUE_CUSTOMER_BOOKINGS = /* GraphQL */ `
  query VenueCustomerBookings($venueId: ID!, $customerId: ID!) {
    venueCustomerBookings(venueId: $venueId, customerId: $customerId) { ${BOOKING_FIELDS} }
  }
`;

export interface ApiVenueCustomer {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  gamesPlayed: number;
  freeGameReady: boolean;
  createdAt: string;
}

/** A subject's loyalty progress toward a free game (by team, user or phone). */
export const VENUE_LOYALTY_STATUS = /* GraphQL */ `
  query VenueLoyaltyStatus($input: LoyaltyStatusInput!) {
    venueLoyaltyStatus(input: $input) {
      configured
      every
      gamesPlayed
      toNext
      ready
      offerId
    }
  }
`;

export interface ApiLoyaltyStatus {
  configured: boolean;
  every: number | null;
  gamesPlayed: number;
  toNext: number;
  ready: boolean;
  offerId: string | null;
}

// ── Memberships (plans + subscriptions) ──────────────────────────────────────

export type ApiMembershipDuration =
  | 'WEEKLY'
  | 'FORTNIGHTLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'HALF_YEARLY'
  | 'YEARLY';
export type ApiSubscriptionStatus = 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

const MEMBERSHIP_PLAN_FIELDS = `
  id
  venueId
  name
  description
  price
  duration
  validityDays
  sessionMinutes
  windows
  daysOfWeek
  sports
  highlight
  isActive
  activeSubscribers
  createdAt
`;

const SUBSCRIPTION_FIELDS = `
  id
  venueId
  planId
  planName
  duration
  price
  sessionMinutes
  slotStart
  daysOfWeek
  sports
  courtId
  courtName
  customerId
  customerName
  customerPhone
  status
  expiringSoon
  startedAt
  expiresAt
  payments { id amount method status periodDays createdAt }
  createdAt
`;

export const VENUE_MEMBERSHIP_PLANS = /* GraphQL */ `
  query VenueMembershipPlans($input: ListMembershipPlansInput!) {
    venueMembershipPlans(input: $input) { ${MEMBERSHIP_PLAN_FIELDS} }
  }
`;

export const CREATE_MEMBERSHIP_PLAN = /* GraphQL */ `
  mutation CreateMembershipPlan($input: CreateMembershipPlanInput!) {
    createMembershipPlan(input: $input) { ${MEMBERSHIP_PLAN_FIELDS} }
  }
`;

export const UPDATE_MEMBERSHIP_PLAN = /* GraphQL */ `
  mutation UpdateMembershipPlan($input: UpdateMembershipPlanInput!) {
    updateMembershipPlan(input: $input) { ${MEMBERSHIP_PLAN_FIELDS} }
  }
`;

export const DELETE_MEMBERSHIP_PLAN = /* GraphQL */ `
  mutation DeleteMembershipPlan($venueId: ID!, $planId: ID!) {
    deleteMembershipPlan(venueId: $venueId, planId: $planId) { id }
  }
`;

export const VENUE_SUBSCRIPTIONS = /* GraphQL */ `
  query VenueSubscriptions($input: ListSubscriptionsInput!) {
    venueSubscriptions(input: $input) {
      items { ${SUBSCRIPTION_FIELDS} }
      pageInfo { page pageSize totalItems totalPages hasNextPage hasPreviousPage }
    }
  }
`;

export const VENUE_SUBSCRIPTION = /* GraphQL */ `
  query VenueSubscription($venueId: ID!, $subscriptionId: ID!) {
    venueSubscription(venueId: $venueId, subscriptionId: $subscriptionId) { ${SUBSCRIPTION_FIELDS} }
  }
`;

export const CREATE_SUBSCRIPTION = /* GraphQL */ `
  mutation CreateSubscription($input: CreateSubscriptionInput!) {
    createSubscription(input: $input) { ${SUBSCRIPTION_FIELDS} }
  }
`;

export const RENEW_SUBSCRIPTION = /* GraphQL */ `
  mutation RenewSubscription($input: RenewSubscriptionInput!) {
    renewSubscription(input: $input) { ${SUBSCRIPTION_FIELDS} }
  }
`;

export const SET_SUBSCRIPTION_STATUS = /* GraphQL */ `
  mutation SetSubscriptionStatus($input: SetSubscriptionStatusInput!) {
    setSubscriptionStatus(input: $input) { ${SUBSCRIPTION_FIELDS} }
  }
`;

export const VENUE_MEMBERSHIP_STATS = /* GraphQL */ `
  query VenueMembershipStats($venueId: ID!) {
    venueMembershipStats(venueId: $venueId) {
      activeMembers
      expiringSoon
      monthlyRevenue
      renewalRatePct
    }
  }
`;

export interface ApiMembershipPlan {
  id: string;
  venueId: string;
  name: string;
  description: string | null;
  price: number;
  duration: ApiMembershipDuration;
  validityDays: number;
  sessionMinutes: number;
  windows: string[];
  daysOfWeek: string[];
  sports: string[];
  highlight: string | null;
  isActive: boolean;
  activeSubscribers: number;
  createdAt: string;
}

export interface ApiSubscriptionPayment {
  id: string;
  amount: number;
  method: string | null;
  status: ApiBookingPaymentStatus;
  periodDays: number | null;
  createdAt: string;
}

/** Offset-pagination metadata returned alongside paginated list payloads. */
export interface ApiPageInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiSubscription {
  id: string;
  venueId: string;
  planId: string;
  planName: string;
  duration: ApiMembershipDuration;
  price: number;
  sessionMinutes: number;
  slotStart: string;
  daysOfWeek: string[];
  sports: string[];
  courtId: string;
  courtName: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  status: ApiSubscriptionStatus;
  expiringSoon: boolean;
  startedAt: string;
  expiresAt: string;
  payments: ApiSubscriptionPayment[];
  createdAt: string;
}

export interface ApiMembershipStats {
  activeMembers: number;
  expiringSoon: number;
  monthlyRevenue: number;
  renewalRatePct: number;
}

/** Courts for the new-booking court picker. */
export const MY_VENUE_COURTS = /* GraphQL */ `
  query MyVenueCourts($venueId: ID!) {
    myVenue(venueId: $venueId) {
      id
      courts {
        id
        name
        pricePerHour
        slotMinutes
        sport { slug name }
      }
    }
  }
`;

export interface ApiCourt {
  id: string;
  name: string;
  pricePerHour: number;
  slotMinutes: number;
  features?: string[];
  sport: { slug: string; name: string };
}

const VENUE_FIELDS = `
  id
  name
  description
  address
  city
  latitude
  longitude
  coverImageUrl
  imageUrls
  amenities
  additionalServices { name price }
  openTime
  closeTime
  contactEmail
  contactPhone
  verificationStatus
  sports { slug name }
  courts { id name pricePerHour slotMinutes features sport { slug name } }
`;

export const MY_VENUE = /* GraphQL */ `
  query MyVenue($venueId: ID!) {
    myVenue(venueId: $venueId) { ${VENUE_FIELDS} }
  }
`;

export const UPDATE_VENUE_PROFILE = /* GraphQL */ `
  mutation UpdateVenueProfile($input: UpdateVenueProfileInput!) {
    updateVenueProfile(input: $input) { id verificationStatus }
  }
`;

export interface ApiVenue {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  imageUrls: string[];
  amenities: string[];
  additionalServices: { name: string; price: number | null }[];
  openTime: string;
  closeTime: string;
  contactEmail: string | null;
  contactPhone: string | null;
  verificationStatus: string;
  sports: { slug: string; name: string }[];
  courts: ApiCourt[];
}

export type ApiBookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';
export type ApiBookingPaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL';
export type ApiCustomerType = 'TEAM' | 'INDIVIDUAL' | 'CLUB';

export interface ApiBooking {
  id: string;
  courtId: string;
  courtName: string;
  sport: { slug: string; name: string };
  customerName: string | null;
  customerPhone: string | null;
  customerType: ApiCustomerType;
  source: 'WALK_IN' | 'ONLINE' | 'SUBSCRIPTION';
  startAt: string;
  endAt: string;
  durationMinutes: number;
  status: ApiBookingStatus;
  paymentStatus: ApiBookingPaymentStatus;
  amountPaid: number;
  subtotal: number;
  discountAmount: number;
  extras: { id: string; name: string; price: number }[];
  extrasTotal: number;
  total: number;
  freeGame: boolean;
  createdAt: string;
}

export interface ApiBookingSummary {
  bookingsToday: number;
  revenueToday: number;
  pendingPayments: number;
}

// ── Response/shape types matching the selections above ───────────────────────

export interface ApiCapability {
  type: 'VENUE' | 'ORGANIZER' | 'COACH';
  status: 'NOT_REQUESTED' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
}

export interface ApiUser {
  id: string;
  fullName: string | null;
  phoneNumber: string;
  email: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'SUPER_ADMIN';
  venueStatus: ApiCapability['status'];
  organizerStatus: ApiCapability['status'];
  capabilities: ApiCapability[];
}

export interface AuthPayload {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: ApiUser;
}

/** Listing moderation status of a venue (distinct from CapabilityStatus). */
export type ApiVenueVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface ApiVenueMembership {
  venueId: string;
  venueName: string;
  role: 'OWNER' | 'MANAGER' | 'FRONT_DESK' | 'STAFF' | 'COACH';
  permissions: string[];
  status: 'INVITED' | 'ACTIVE' | 'SUSPENDED';
  verificationStatus: ApiVenueVerificationStatus;
}

export interface IdentityResponse {
  me: ApiUser;
  myVenueMemberships: ApiVenueMembership[];
}

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
  total
  freeGame
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
  total: number;
  freeGame: boolean;
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

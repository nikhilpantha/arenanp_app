import type {
  Capability,
  Panel,
  Profile,
  VenueMemberRole,
  VenueMembershipSummary,
  VenuePermission,
} from '@/types';

/**
 * Maps the backend's additive identity model (capabilities + venue memberships)
 * to the app's switchable panels. A user always has the player panel; the venue
 * panel appears once they hold a venue relationship (a membership or a requested
 * VENUE capability — including while it's pending review).
 */

/** Default permission set per venue role. Mirrors the backend ROLE_PERMISSIONS. */
export const ROLE_PERMISSIONS: Record<VenueMemberRole, VenuePermission[]> = {
  OWNER: [
    'venue:edit',
    'bookings:read',
    'bookings:write',
    'calendar:manage',
    'customers:read',
    'offers:manage',
    'memberships:manage',
    'teams:manage',
    'finance:read',
    'finance:payout',
    'staff:manage',
  ],
  MANAGER: [
    'venue:edit',
    'bookings:read',
    'bookings:write',
    'calendar:manage',
    'customers:read',
    'offers:manage',
    'memberships:manage',
    'teams:manage',
    'finance:read',
  ],
  FRONT_DESK: ['bookings:read', 'bookings:write', 'calendar:manage', 'customers:read'],
  STAFF: ['bookings:read', 'calendar:manage', 'customers:read'],
  COACH: ['bookings:read', 'calendar:manage'],
};

/** Accent theme key per panel. */
export const PANEL_ACCENT: Record<Panel, 'player' | 'venue'> = {
  player: 'player',
  venue: 'venue',
};

export const PANEL_LABEL: Record<Panel, string> = {
  player: 'Player',
  venue: 'Venue',
};

/** The user's VENUE capability, if they've ever requested it. */
export function venueCapability(profile: Profile | null): Capability | undefined {
  return profile?.capabilities.find((c) => c.type === 'VENUE');
}

/**
 * Derive a venue membership from the VENUE capability alone. Temporary shim until
 * the backend exposes `myVenueMemberships` (venue self-service module): a user
 * with the VENUE capability is treated as the OWNER of their venue, with the
 * listing's review status mirrored from the capability so the under-review gate
 * works. Real memberships (incl. staff seats) replace this once available.
 */
export function venueMembershipsFromCapabilities(
  capabilities: Capability[],
): VenueMembershipSummary[] {
  const venue = capabilities.find((c) => c.type === 'VENUE');
  if (!venue || venue.status === 'NOT_REQUESTED') return [];
  return [
    {
      venueId: 'me-venue',
      venueName: 'My venue',
      role: 'OWNER',
      permissions: ROLE_PERMISSIONS.OWNER,
      status: venue.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
      verificationStatus: venue.status,
    },
  ];
}

/** True when the membership grants the given permission. */
export function hasVenuePermission(
  membership: VenueMembershipSummary | null | undefined,
  permission: VenuePermission,
): boolean {
  return Boolean(membership?.permissions.includes(permission));
}

/** The membership the venue panel currently operates under (first active, else first). */
export function primaryVenueMembership(
  profile: Profile | null,
): VenueMembershipSummary | undefined {
  const memberships = profile?.venueMemberships ?? [];
  return memberships.find((m) => m.status === 'ACTIVE') ?? memberships[0];
}

/** Whether the venue panel should be offered at all (has any venue relationship). */
export function canAccessVenuePanel(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.venueMemberships.length > 0) return true;
  const cap = venueCapability(profile);
  return Boolean(cap && cap.status !== 'NOT_REQUESTED');
}

/** Whether the player panel should be offered — the account holds the PLAYER role. */
export function canAccessPlayerPanel(profile: Profile | null): boolean {
  if (!profile) return false;
  return profile.capabilities.some((c) => c.type === 'PLAYER' && c.status !== 'NOT_REQUESTED');
}

/**
 * Panels the user can switch between, derived from their real capabilities.
 * Player is no longer a forced default — a venue-only account gets just 'venue'.
 * The fallback keeps a never-empty result for an account mid-provisioning.
 */
export function availablePanels(profile: Profile | null): Panel[] {
  const panels: Panel[] = [];
  if (canAccessPlayerPanel(profile)) panels.push('player');
  if (canAccessVenuePanel(profile)) panels.push('venue');
  return panels.length ? panels : ['player'];
}

import { FlatList, Modal, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge, type BadgeVariant, Icon, Typography } from '@/components/common';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { primaryVenueMembership } from '@/lib/panels';
import { useActiveVenueStore, useAuthStore } from '@/stores';

/** Listing status → badge. A PENDING venue reads "Under review" (not yet listed). */
export const VENUE_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  APPROVED: { label: 'Live', variant: 'success' },
  PENDING_VERIFICATION: { label: 'Under review', variant: 'warning' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  SUSPENDED: { label: 'Suspended', variant: 'danger' },
  NOT_REQUESTED: { label: 'Draft', variant: 'neutral' },
};

/**
 * Bottom-sheet venue switcher. Lists the owner's venues (with listing status),
 * switches the active venue on tap, and offers "Add new venue". Shared by the
 * dashboard header and the profile identity card.
 */
export function VenueSwitcherSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const activeVenueId = useActiveVenueStore((s) => s.activeVenueId);
  const setActiveVenueId = useActiveVenueStore((s) => s.setActiveVenueId);

  const memberships = profile?.venueMemberships ?? [];
  const active =
    memberships.find((m) => m.venueId === activeVenueId) ??
    primaryVenueMembership(profile) ??
    memberships[0];

  const select = (venueId: string) => {
    setActiveVenueId(venueId);
    onClose();
  };

  const addVenue = () => {
    onClose();
    router.push('/create-venue');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.bg,
            borderTopLeftRadius: Radius['3xl'],
            borderTopRightRadius: Radius['3xl'],
            paddingTop: Spacing.md,
            paddingBottom: Spacing.xl,
            maxHeight: '70%',
          }}>
          <View className="items-center pb-md">
            <View className="h-1 w-10 rounded-full" style={{ backgroundColor: theme.border }} />
          </View>
          <View className="px-page pb-sm">
            <Typography variant="label-lg">Your venues</Typography>
          </View>
          <FlatList
            data={memberships}
            keyExtractor={(m) => m.venueId}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = item.venueId === active?.venueId;
              const status = VENUE_STATUS_BADGE[item.verificationStatus] ?? VENUE_STATUS_BADGE.NOT_REQUESTED;
              return (
                <Pressable
                  onPress={() => select(item.venueId)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className="mx-page my-[2px] flex-row items-center gap-md rounded-2xl px-md py-md"
                  style={{ backgroundColor: selected ? `${theme.primary}14` : theme.card }}>
                  <View className="flex-1 gap-xs">
                    <Typography variant="body-lg" numberOfLines={1}>
                      {item.venueName}
                    </Typography>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </View>
                  {selected ? <Icon name="check" size={20} color={theme.primary} /> : null}
                </Pressable>
              );
            }}
            ListFooterComponent={
              <Pressable
                onPress={addVenue}
                accessibilityRole="button"
                accessibilityLabel="Add new venue"
                className="mx-page mt-sm flex-row items-center gap-sm rounded-2xl px-md py-md"
                style={{ borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed' }}>
                <View
                  className="h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${theme.primary}1A` }}>
                  <Icon name="plus" size={18} color={theme.primary} />
                </View>
                <Typography variant="label-md" color={theme.primary}>
                  Add new venue
                </Typography>
              </Pressable>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

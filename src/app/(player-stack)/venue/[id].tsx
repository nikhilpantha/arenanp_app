import { Share, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  Button,
  ExpandableText,
  FormScreen,
  HeaderAction,
  InlineLoader,
  ScreenHeader,
  Typography,
} from '@/components/common';
import { VenueAmenities } from '@/components/player/venues/detail/VenueAmenities';
import { VenueCourts } from '@/components/player/venues/detail/VenueCourts';
import { VenueGallery } from '@/components/player/venues/detail/VenueGallery';
import { VenueMapCard } from '@/components/player/venues/detail/VenueMapCard';
import { VenueMemberships } from '@/components/player/venues/detail/VenueMemberships';
import { VenueOverview } from '@/components/player/venues/detail/VenueOverview';
import { VenueServices } from '@/components/player/venues/detail/VenueServices';
import { useRefresh } from '@/hooks/use-refresh';
import { type PublicCourtData, useVenueDetail } from '@/lib/api/discovery';
import { useVenueMembershipPlans } from '@/lib/api/subscriptions';
import { openInMaps } from '@/lib/maps';

export default function VenueDetailScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const venueQ = useVenueDetail(id);
  const { data: venue, isLoading } = venueQ;
  const { refreshing, onRefresh } = useRefresh(venueQ);
  const plans = useVenueMembershipPlans(id).data ?? [];

  const share = () => {
    const label = venue?.name ?? name ?? 'this venue';
    Share.share({
      title: venue?.name ?? 'Venue',
      message: `Check out ${label} on Arena Nepal Sport`,
      url: `app://venue/${id}`,
    }).catch(() => undefined);
  };

  const book = (court?: PublicCourtData) =>
    router.push({
      pathname: '/venue/[id]/book',
      params: { id: id ?? '', name: venue?.name ?? name ?? '', courtId: court?.id ?? '' },
    });

  const lat = venue?.latitude;
  const lng = venue?.longitude;
  const directions = () => {
    if (lat != null && lng != null) openInMaps(lat, lng);
  };

  const header = (
    <ScreenHeader
      title={venue?.name ?? name ?? 'Venue'}
      onBack={() => router.back()}
      right={
        <View className="flex-row gap-sm">
          <HeaderAction icon="share" label="Share venue" onPress={share} />
          {lat != null && lng != null ? (
            <HeaderAction icon="navigation" label="Open in Google Maps" onPress={directions} />
          ) : null}
        </View>
      }
    />
  );

  if (isLoading || !venue) {
    return (
      <FormScreen header={header}>
        <InlineLoader paddingVertical={64} />
      </FormScreen>
    );
  }

  const location = [venue.address, venue.city].filter(Boolean).join(', ');

  return (
    <FormScreen
      scroll
      header={header}
      refreshing={refreshing}
      onRefresh={onRefresh}
      footer={
        <Button size="lg" fullWidth className="rounded-full" rightIcon="arrowRight" onPress={() => book()}>
          {venue.priceFrom != null ? `Book now · From Rs ${venue.priceFrom}` : 'Book now'}
        </Button>
      }>
      <View className="gap-xl">
        <VenueGallery images={venue.images} sportsCount={venue.sports.length} />

        <VenueOverview venue={venue} />

        {venue.description ? (
          <View className="gap-xs">
            <Typography variant="label-lg">About</Typography>
            <ExpandableText text={venue.description} />
          </View>
        ) : null}

        <VenueServices services={venue.additionalServices} />

        <VenueCourts courts={venue.courts} venueName={venue.name} onBook={book} />

        <VenueMemberships plans={plans} />

        <VenueAmenities amenities={venue.amenities} />

        {venue.latitude != null || location ? (
          <View className="gap-sm">
            <Typography variant="label-lg">Location</Typography>
            <VenueMapCard
              latitude={venue.latitude}
              longitude={venue.longitude}
              address={location || undefined}
            />
          </View>
        ) : null}
      </View>
    </FormScreen>
  );
}

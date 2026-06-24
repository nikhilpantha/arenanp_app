import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  Avatar,
  Badge,
  type BadgeVariant,
  Button,
  Card,
  Icon,
  InlineLoader,
  Screen,
  ScreenHeader,
  Typography,
  useToast,
} from '@/components/common';
import { subscriptionBadge } from '@/components/venue/bookings/booking-meta';
import { getMember, getTier } from '@/data/memberships';
import { useRefresh } from '@/hooks/use-refresh';
import { useTheme } from '@/hooks/use-theme';
import {
  useRenewSubscription,
  useSetSubscriptionStatus,
  useSubscriptionsApiEnabled,
  useVenueSubscription,
} from '@/lib/api/subscriptions';
import { cadenceLabel, slotLabel } from '@/lib/subscription-format';
import type { MemberStatus } from '@/types';

type Theme = ReturnType<typeof useTheme>;

const STATUS_BADGE: Record<MemberStatus, { variant: BadgeVariant; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  expiring: { variant: 'warning', label: 'Expiring soon' },
  expired: { variant: 'danger', label: 'Expired' },
};

/** Long date label, e.g. "Jun 30, 2026". */
function longDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Whole days from now until an instant (negative if past). */
function daysFromNow(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

/** Whole days between two instants. */
function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000);
}

export default function MemberDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const apiEnabled = useSubscriptionsApiEnabled();
  // The subscription query lives in LiveMember, so refresh all mounted queries.
  const { refreshing, onRefresh } = useRefresh();

  return (
    <Screen scroll refreshing={refreshing} onRefresh={onRefresh}>
      <View className="pt-sm">
        <ScreenHeader title="Member" onBack={() => router.back()} />
      </View>
      {apiEnabled ? (
        <LiveMember id={id ?? ''} theme={theme} onDone={() => router.back()} />
      ) : (
        <MockMember id={id ?? ''} theme={theme} onDone={() => router.back()} />
      )}
    </Screen>
  );
}

function LiveMember({ id, theme, onDone }: { id: string; theme: Theme; onDone: () => void }) {
  const toast = useToast();
  const subQ = useVenueSubscription(id);
  const renew = useRenewSubscription();
  const setStatus = useSetSubscriptionStatus();
  const sub = subQ.data;

  if (subQ.isLoading) return <InlineLoader paddingVertical={48} />;
  if (subQ.isError || !sub) return <NotFound theme={theme} />;

  const badge = subscriptionBadge(sub.status, sub.expiringSoon);
  const paused = sub.status === 'paused';
  const scheduled = sub.status === 'scheduled';
  const pending = sub.status === 'pending';

  // Lifecycle-aware actions: only show what makes sense for the current state.
  const canApprove = pending; // the owner accepts the player's request
  const canRenew = sub.status === 'expired' || sub.expiringSoon;
  const canPause = sub.status === 'active' || sub.status === 'paused';
  const canCancel = sub.status !== 'expired' && sub.status !== 'cancelled';

  const daysToStart = Math.max(0, daysFromNow(sub.startedAt));
  const daysLeft = Math.max(0, daysFromNow(sub.expiresAt));
  const lengthDays = daysBetween(sub.startedAt, sub.expiresAt);

  const onRenew = () =>
    renew.mutate(
      { subscriptionId: sub.id },
      {
        onSuccess: () => {
          toast.success(`${sub.planName} renewed.`, 'Membership renewed');
          onDone();
        },
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : 'Please try again.', "Couldn't renew"),
      },
    );

  // Accept the request. We send `active`; the backend reconciles it to `scheduled`
  // when the player's start date is still in the future, then auto-activates on that day.
  const onApprove = () =>
    setStatus.mutate(
      { subscriptionId: sub.id, status: 'active' },
      {
        onSuccess: () =>
          toast.success(
            `${sub.customerName} starts ${longDate(sub.startedAt)}.`,
            'Request accepted',
          ),
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : 'Please try again.', "Couldn't accept"),
      },
    );

  const onTogglePause = () =>
    setStatus.mutate(
      { subscriptionId: sub.id, status: paused ? 'active' : 'paused' },
      {
        onSuccess: () => toast.success(paused ? 'Membership resumed.' : 'Membership paused.'),
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : 'Please try again.', "Couldn't update"),
      },
    );

  const onCancel = () =>
    Alert.alert(
      pending ? 'Decline request?' : 'Cancel membership?',
      `${sub.customerName} · ${sub.planName}`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: pending ? 'Decline' : 'Cancel',
          style: 'destructive',
          onPress: () =>
            setStatus.mutate(
              { subscriptionId: sub.id, status: 'cancelled' },
              {
                onSuccess: () => {
                  toast.success(pending ? 'Request declined.' : 'Membership cancelled.');
                  onDone();
                },
                onError: (e) =>
                  toast.error(
                    e instanceof Error ? e.message : 'Please try again.',
                    pending ? "Couldn't decline" : "Couldn't cancel",
                  ),
              },
            ),
        },
      ],
    );

  return (
    <>
      <Card elevation="md" className="mt-md flex-row items-center gap-md">
        <Avatar fallback={sub.customerName} size={52} />
        <View className="flex-1 gap-[2px]">
          <Typography variant="headline-md">{sub.customerName}</Typography>
          {sub.customerPhone ? (
            <Typography variant="body-md" color={theme.inkMuted}>
              {sub.customerPhone}
            </Typography>
          ) : null}
        </View>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </Card>

      <Card elevation="sm" className="mt-md gap-sm">
        <Row label="Plan" value={sub.planName} theme={theme} />
        <Row label="Daily slot" value={slotLabel(sub.slotStart, sub.sessionMinutes)} theme={theme} />
        <Row label="Days" value={cadenceLabel(sub.daysOfWeek)} theme={theme} />
        <Row
          label={scheduled ? 'Starts on' : 'Started'}
          value={longDate(sub.startedAt)}
          highlight
          theme={theme}
        />
        <Row label="Ends" value={longDate(sub.expiresAt)} theme={theme} />
        {scheduled ? (
          <>
            <Row label="Starts in" value={`${daysToStart} days`} highlight theme={theme} />
            <Row label="Membership length" value={`${lengthDays} days`} theme={theme} />
          </>
        ) : sub.status === 'active' ? (
          <Row label="Days left" value={`${daysLeft} days`} highlight theme={theme} />
        ) : null}
      </Card>

      {sub.payments.length > 0 ? (
        <View className="gap-sm pt-lg">
          <Typography variant="label-md" color={theme.inkMuted}>
            Payment history
          </Typography>
          <Card elevation="sm">
            {sub.payments.map((p, i) => (
              <View
                key={p.id}
                className="flex-row items-center justify-between py-sm"
                style={
                  i < sub.payments.length - 1
                    ? { borderBottomWidth: 1, borderColor: theme.border }
                    : undefined
                }>
                <View className="gap-[2px]">
                  <Typography variant="label-md">Rs {p.amount}</Typography>
                  <Typography variant="body-md" color={theme.inkMuted}>
                    {longDate(p.date)}
                    {p.method ? ` · ${p.method.toLowerCase()}` : ''}
                  </Typography>
                </View>
                <Badge
                  variant={
                    p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'
                  }>
                  {p.status}
                </Badge>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      <View className="gap-sm pt-xl">
        {canApprove ? (
          <Button
            size="lg"
            fullWidth
            className="rounded-full"
            rightIcon="check"
            loading={setStatus.isPending}
            onPress={onApprove}>
            Accept request
          </Button>
        ) : null}
        {canRenew ? (
          <Button
            size="lg"
            fullWidth
            className="rounded-full"
            rightIcon="check"
            loading={renew.isPending}
            onPress={onRenew}>
            Renew membership
          </Button>
        ) : null}
        {canPause || canCancel ? (
          <View className="flex-row gap-sm">
            {canPause ? (
              <Button
                variant="tertiary"
                size="md"
                className="flex-1 rounded-full"
                onPress={onTogglePause}>
                {paused ? 'Resume' : 'Pause'}
              </Button>
            ) : null}
            {canCancel ? (
              <Button variant="ghost" size="md" className="flex-1 rounded-full" onPress={onCancel}>
                {pending ? 'Decline' : 'Cancel'}
              </Button>
            ) : null}
          </View>
        ) : null}
      </View>
    </>
  );
}

function MockMember({ id, theme, onDone }: { id: string; theme: Theme; onDone: () => void }) {
  const member = getMember(id);
  const tier = member ? getTier(member.tierId) : null;

  if (!member) return <NotFound theme={theme} />;

  return (
    <>
      <Card elevation="md" className="mt-md flex-row items-center gap-md">
        <Avatar fallback={member.name} size={52} />
        <View className="flex-1 gap-[2px]">
          <Typography variant="headline-md">{member.name}</Typography>
          <Typography variant="body-md" color={theme.inkMuted}>
            {member.phone}
          </Typography>
        </View>
        <Badge variant={STATUS_BADGE[member.status].variant}>
          {STATUS_BADGE[member.status].label}
        </Badge>
      </Card>

      <Card elevation="sm" className="mt-md gap-sm">
        <Row label="Plan" value={tier?.name ?? '—'} theme={theme} />
        <Row
          label="Sessions left"
          value={`${member.remainingSessions} / ${member.totalSessions}`}
          theme={theme}
        />
        <Row label="Joined" value={member.joinedAt} theme={theme} />
        <Row label="Expires" value={member.expiresAt} theme={theme} />
      </Card>

      {member.payments.length > 0 ? (
        <View className="gap-sm pt-lg">
          <Typography variant="label-md" color={theme.inkMuted}>
            Payment history
          </Typography>
          <Card elevation="sm">
            {member.payments.map((p, i) => (
              <View
                key={p.id}
                className="flex-row items-center justify-between py-sm"
                style={
                  i < member.payments.length - 1
                    ? { borderBottomWidth: 1, borderColor: theme.border }
                    : undefined
                }>
                <View className="gap-[2px]">
                  <Typography variant="label-md">Rs {p.amount}</Typography>
                  <Typography variant="body-md" color={theme.inkMuted}>
                    {p.date} · {p.method}
                  </Typography>
                </View>
                <Badge
                  variant={
                    p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'
                  }>
                  {p.status}
                </Badge>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      <View className="pt-xl">
        <Button
          size="lg"
          fullWidth
          className="rounded-full"
          rightIcon="check"
          onPress={() => Alert.alert('Membership renewed', undefined, [{ text: 'Done', onPress: onDone }])}>
          Renew membership
        </Button>
      </View>
    </>
  );
}

function NotFound({ theme }: { theme: Theme }) {
  return (
    <View className="flex-1 items-center justify-center gap-sm pt-xl">
      <Icon name="users" size={28} color={theme.inkMuted} />
      <Typography variant="label-lg">Member not found</Typography>
    </View>
  );
}

function Row({
  label,
  value,
  highlight,
  theme,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  theme: Theme;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Typography variant="body-md" color={theme.inkMuted}>
        {label}
      </Typography>
      <Typography variant="label-md" color={highlight ? theme.primary : theme.ink}>
        {value}
      </Typography>
    </View>
  );
}

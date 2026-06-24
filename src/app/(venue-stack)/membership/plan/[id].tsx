import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  ConfirmModal,
  InlineLoader,
  Screen,
  ScreenHeader,
  Typography,
  useToast,
} from '@/components/common';
import { PlanDetailBody } from '@/components/venue/bookings/subscribe/PlanDetailBody';
import { useRefresh } from '@/hooks/use-refresh';
import { useTheme } from '@/hooks/use-theme';
import {
  useDeleteMembershipPlan,
  useMembershipPlans,
  usePlanActiveMembers,
  useSetPlanActive,
} from '@/lib/api/subscriptions';

export default function PlanDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();

  const plansQ = useMembershipPlans();
  const membersQ = usePlanActiveMembers(id);
  const { refreshing, onRefresh } = useRefresh(plansQ, membersQ);
  const setActive = useSetPlanActive();
  const del = useDeleteMembershipPlan();
  const plan = plansQ.data?.find((p) => p.id === id);

  // Which destructive action is awaiting confirmation, plus any inline failure to show in it.
  const [confirm, setConfirm] = useState<'deactivate' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeConfirm = () => {
    setConfirm(null);
    setError(null);
  };

  // Toggling on (activating) is harmless, so it runs immediately; deactivating asks first.
  const onToggleActive = () => {
    if (!plan) return;
    if (plan.isActive) {
      setError(null);
      setConfirm('deactivate');
      return;
    }
    setActive.mutate(
      { planId: plan.id, isActive: true },
      {
        onSuccess: () => toast.success('Plan activated'),
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : 'Please try again.', "Couldn't update"),
      },
    );
  };

  const confirmDeactivate = () => {
    if (!plan) return;
    setError(null);
    setActive.mutate(
      { planId: plan.id, isActive: false },
      {
        onSuccess: () => {
          closeConfirm();
          toast.success('Plan deactivated');
        },
        onError: (e) => setError(e instanceof Error ? e.message : 'Please try again.'),
      },
    );
  };

  const confirmDelete = () => {
    if (!plan) return;
    setError(null);
    del.mutate(plan.id, {
      onSuccess: () => {
        closeConfirm();
        toast.success('Plan deleted');
        router.back();
      },
      // The backend explains why (e.g. running memberships + when it can be deleted).
      onError: (e) => setError(e instanceof Error ? e.message : 'Try again.'),
    });
  };

  return (
    <Screen scroll refreshing={refreshing} onRefresh={onRefresh}>
      <View className="pt-sm">
        <ScreenHeader title="Plan" onBack={() => router.back()} />
      </View>

      {plansQ.isLoading ? (
        <InlineLoader paddingVertical={48} />
      ) : !plan ? (
        <Typography variant="body-md" color={theme.inkMuted} style={{ paddingTop: 16 }}>
          Plan not found.
        </Typography>
      ) : (
        <>
          <PlanDetailBody
            plan={plan}
            members={membersQ.data ?? []}
            membersLoading={membersQ.isLoading}
            toggling={setActive.isPending}
            deleting={del.isPending}
            onEdit={() =>
              router.push({ pathname: '/membership/edit/[id]', params: { id: plan.id } })
            }
            onToggleActive={onToggleActive}
            onDelete={() => {
              setError(null);
              setConfirm('delete');
            }}
            onViewAll={() =>
              router.push({ pathname: '/membership/members', params: { planId: plan.id } })
            }
            onOpenMember={(mid) => router.push({ pathname: '/member/[id]', params: { id: mid } })}
          />

          <ConfirmModal
            visible={confirm === 'deactivate'}
            onClose={closeConfirm}
            onConfirm={confirmDeactivate}
            title="Deactivate plan?"
            description={`“${plan.name}” will be hidden from new memberships. Existing members keep theirs, and you can reactivate it anytime.`}
            confirmLabel="Deactivate"
            confirmIcon="ban"
            destructive
            loading={setActive.isPending}
            error={error}
          />

          <ConfirmModal
            visible={confirm === 'delete'}
            onClose={closeConfirm}
            onConfirm={confirmDelete}
            title="Delete plan?"
            description={`“${plan.name}” will be removed permanently. This can’t be undone.`}
            confirmLabel="Delete"
            confirmIcon="xCircle"
            destructive
            loading={del.isPending}
            error={error}
          />
        </>
      )}
    </Screen>
  );
}

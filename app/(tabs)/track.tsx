import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Phone,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Info,
  Package,
  HelpCircle,
} from 'lucide-react-native';
import { RouteMap } from '../../src/components/maps/RouteMap';
import { StatusStepper } from '../../src/components/cards/StatusStepper';
import { OtpSecurityCard } from '../../src/components/cards/OtpSecurityCard';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useOrdersStore } from '../../src/store/useOrdersStore';
import { useTrackingStore } from '../../src/store/useTrackingStore';

export default function LiveTrackScreen() {
  const router = useRouter();
  const orders = useOrdersStore((s) => s.orders);
  const activeOrderId = useOrdersStore((s) => s.activeOrderId);
  const getOrderById = useOrdersStore((s) => s.getOrderById);

  const currentOrder = useTrackingStore((s) => s.currentOrder);
  const trackingState = useTrackingStore((s) => s.trackingState);
  const isSimulating = useTrackingStore((s) => s.isSimulating);
  const bindOrder = useTrackingStore((s) => s.bindOrder);
  const pauseTracking = useTrackingStore((s) => s.pauseTracking);
  const resumeTracking = useTrackingStore((s) => s.resumeTracking);
  const resetSimulation = useTrackingStore((s) => s.resetSimulation);
  const advanceNextStep = useTrackingStore((s) => s.advanceNextStep);

  // If no order currently bound, bind the active order or the most recent non-cancelled order
  useEffect(() => {
    if (!currentOrder && orders.length > 0) {
      const active = activeOrderId
        ? getOrderById(activeOrderId)
        : orders.find((o) => !['delivered', 'cancelled'].includes(o.status)) || orders[0];

      if (active) {
        bindOrder(active);
      }
    }
  }, [orders, activeOrderId, currentOrder]);

  if (!currentOrder) {
    return (
      <View style={styles.emptyContainer}>
        <Package color={colors.textMuted} size={64} style={{ marginBottom: spacing.base }} />
        <Text style={[styles.emptyTitle, typography.h2]}>No Active Deliveries</Text>
        <Text style={[styles.emptySubtitle, typography.body]}>
          Book a parcel to experience real-time bike route navigation and live OTP handover.
        </Text>
        <Button
          title="Send a Parcel"
          onPress={() => router.push('/booking/pickup')}
          style={{ marginTop: spacing.xl, width: 200 }}
        />
      </View>
    );
  }

  const isDelivered = trackingState?.status === 'delivered' || currentOrder.status === 'delivered';
  const isCancelled = currentOrder.status === 'cancelled';
  const isPlaying = trackingState?.isPlaying ?? true;
  const currentStatus = trackingState?.status || currentOrder.status;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View>
            <Text style={[styles.headerTrackingCode, typography.h2]}>
              {currentOrder.trackingCode}
            </Text>
            <Text style={[styles.headerSubtitle, typography.caption]}>
              {currentOrder.parcel.description || `${currentOrder.parcel.category} package`} • {currentOrder.vehicleType.toUpperCase()}
            </Text>
          </View>
          <Badge
            status={currentStatus}
            label={currentStatus.replace('_', ' ')}
          />
        </Animated.View>

        {/* Live Vector Map with Rotating Bike Rider Marker */}
        <Animated.View entering={FadeInDown.delay(100).duration(450)}>
          <RouteMap
            order={currentOrder}
            trackingState={trackingState}
            height={280}
            showOtpPill={true}
            onResetSimulation={resetSimulation}
          />
        </Animated.View>

        {/* 4-DIGIT OTP SECURITY HANDOVER CARD (Reference Image 2) */}
        {!isDelivered && !isCancelled && (
          <Animated.View entering={FadeInDown.delay(150).duration(450)}>
            <OtpSecurityCard
              pickupOtp={currentOrder.pickupOtp || '8738'}
              deliveryOtp={currentOrder.deliveryOtp || '4912'}
              currentStatus={currentStatus}
              trackingCode={currentOrder.trackingCode}
              driverName={currentOrder.deliveryPartner?.name}
            />
          </Animated.View>
        )}

        {/* Simulation Controls Toolbar (For Live Preview & Testing) */}
        <Animated.View entering={FadeInDown.delay(200).duration(450)} style={[styles.controlsCard, shadows.sm]}>
          <View style={styles.controlsHeader}>
            <View style={styles.devPill}>
              <View style={styles.devPillDot} />
              <Text style={[styles.devPillText, typography.micro]}>DEV SIMULATION CONTROLS</Text>
            </View>

            <Text style={[styles.stepCountText, typography.micro]}>
              WAYPOINT {trackingState ? trackingState.currentWaypointIndex + 1 : 1} OF{' '}
              {trackingState?.totalWaypoints || 7}
            </Text>
          </View>

          <View style={styles.simButtonsRow}>
            <Pressable
              style={styles.simBtn}
              onPress={isPlaying ? pauseTracking : resumeTracking}
              accessibilityLabel={isPlaying ? 'Pause simulation' : 'Resume simulation'}
            >
              {isPlaying ? (
                <>
                  <Pause color={colors.textPrimary} size={15} />
                  <Text style={[styles.simBtnText, typography.captionBold]}>Pause</Text>
                </>
              ) : (
                <>
                  <Play color={colors.primary} size={15} />
                  <Text style={[styles.simBtnText, typography.captionBold]}>Resume</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={styles.simBtn}
              onPress={advanceNextStep}
              accessibilityLabel="Advance next waypoint"
            >
              <SkipForward color={colors.textPrimary} size={15} />
              <Text style={[styles.simBtnText, typography.captionBold]}>Next Step</Text>
            </Pressable>

            <Pressable
              style={styles.simBtn}
              onPress={resetSimulation}
              accessibilityLabel="Reset simulation"
            >
              <RotateCcw color={colors.textPrimary} size={15} />
              <Text style={[styles.simBtnText, typography.captionBold]}>Restart</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Live Status Progression Stepper */}
        <Animated.View entering={FadeInDown.delay(250).duration(450)} style={[styles.card, shadows.sm]}>
          <Text style={[styles.cardTitle, typography.captionBold]}>DELIVERY PROGRESSION</Text>
          <StatusStepper currentStatus={currentStatus} />
        </Animated.View>

        {/* Delivery Partner Sheet (Reference Image 1 & 2) */}
        {currentOrder.deliveryPartner && (
          <Animated.View entering={FadeInDown.delay(300).duration(450)} style={[styles.partnerCard, shadows.sm]}>
            <View style={styles.partnerTopRow}>
              <Image
                source={{ uri: currentOrder.deliveryPartner.avatarUrl }}
                style={styles.partnerAvatar}
              />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[styles.partnerName, typography.bodyBold]}>
                  {currentOrder.deliveryPartner.name}
                </Text>
                <Text style={[styles.partnerVehicle, typography.caption]}>
                  {currentOrder.deliveryPartner.vehicleNumber} • {currentOrder.deliveryPartner.vehicleType}
                </Text>
                <Text style={[styles.partnerRating, typography.captionBold]}>
                  ★ {currentOrder.deliveryPartner.rating} ({currentOrder.deliveryPartner.totalDeliveries}+ deliveries)
                </Text>
              </View>

              <View style={styles.partnerActionButtons}>
                <Pressable
                  style={styles.callBtn}
                  onPress={() =>
                    Alert.alert(
                      'Call Courier Partner',
                      `Connecting call to ${currentOrder.deliveryPartner?.name} (${currentOrder.deliveryPartner?.phone})`
                    )
                  }
                  accessibilityLabel="Call partner"
                >
                  <Phone color="#FFFFFF" size={18} />
                </Pressable>
                <Pressable
                  style={styles.chatBtn}
                  onPress={() =>
                    Alert.alert(
                      'In-App Chat',
                      `Opening live chat with courier partner ${currentOrder.deliveryPartner?.name}.`
                    )
                  }
                  accessibilityLabel="Message partner"
                >
                  <MessageSquare color={colors.primary} size={18} />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Trip Addresses */}
        <Animated.View entering={FadeInDown.delay(350).duration(450)} style={[styles.card, shadows.sm]}>
          <Text style={[styles.cardTitle, typography.captionBold]}>TRIP DETAILS</Text>

          <View style={styles.locationNode}>
            <View style={[styles.nodeDot, { backgroundColor: colors.success }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.nodeHeading, typography.caption]}>Pickup Location</Text>
              <Text style={[styles.nodeAddress, typography.bodyBold]}>
                {currentOrder.pickupAddress.streetAddress}
              </Text>
              <Text style={[styles.nodeContact, typography.caption]}>
                {currentOrder.pickupAddress.contactName} • +91 {currentOrder.pickupAddress.contactPhone}
              </Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.locationNode}>
            <View style={[styles.nodeDot, { backgroundColor: colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.nodeHeading, typography.caption]}>Drop Destination</Text>
              <Text style={[styles.nodeAddress, typography.bodyBold]}>
                {currentOrder.dropAddress.streetAddress}
              </Text>
              <Text style={[styles.nodeContact, typography.caption]}>
                {currentOrder.dropAddress.contactName} • +91 {currentOrder.dropAddress.contactPhone}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Cancellation Option (Reference Image 2) */}
        {!['delivered', 'cancelled'].includes(currentStatus) && (
          <Pressable
            style={styles.cancelLink}
            onPress={() =>
              router.push({
                pathname: '/orders/cancel',
                params: { id: currentOrder.id },
              })
            }
          >
            <Text style={[styles.cancelLinkText, typography.captionBold]}>
              Want to cancel order?
            </Text>
          </Pressable>
        )}

        {/* View Full Order Details button */}
        <Pressable
          style={styles.fullDetailsBtn}
          onPress={() => router.push(`/orders/${currentOrder.id}`)}
        >
          <Text style={[styles.fullDetailsText, typography.bodyBold]}>
            View Complete Order & Receipt
          </Text>
          <ChevronRight color={colors.textSecondary} size={18} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 54,
  },
  scrollContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: 110,
    gap: spacing.base,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTrackingCode: {
    color: colors.textPrimary,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  controlsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  controlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  devPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  devPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 6,
  },
  devPillText: {
    color: '#1E40AF',
    fontWeight: '800',
  },
  stepCountText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  simBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
    gap: 6,
  },
  simBtnText: {
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardTitle: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  partnerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  partnerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.primarySoft,
  },
  partnerName: {
    color: colors.textPrimary,
  },
  partnerVehicle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  partnerRating: {
    color: colors.warningDark,
    marginTop: 3,
  },
  partnerActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationNode: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  nodeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  nodeHeading: {
    color: colors.textMuted,
  },
  nodeAddress: {
    color: colors.textPrimary,
    marginTop: 2,
  },
  nodeContact: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  routeDivider: {
    height: 20,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
    marginVertical: 4,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelLinkText: {
    color: colors.danger,
  },
  fullDetailsBtn: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  fullDetailsText: {
    color: colors.textPrimary,
  },
});

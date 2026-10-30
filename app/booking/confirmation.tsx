import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import {
  Check,
  Navigation,
  Home,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react-native';
import { Button } from '../../src/components/common/Button';
import { PackageIllustration } from '../../src/components/illustrations/PackageIllustration';
import { OtpSecurityCard } from '../../src/components/cards/OtpSecurityCard';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useOrdersStore } from '../../src/store/useOrdersStore';
import { useBookingStore } from '../../src/store/useBookingStore';
import { useTrackingStore } from '../../src/store/useTrackingStore';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId: string }>();
  const orderId = params.orderId;

  const order = useOrdersStore((s) => s.getOrderById(orderId || ''));
  const resetBooking = useBookingStore((s) => s.resetBooking);
  const bindOrder = useTrackingStore((s) => s.bindOrder);

  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    checkmarkScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    // Reset booking store draft now that it's confirmed
    resetBooking();
  }, []);

  const animatedCheckmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const handleTrackOrder = () => {
    if (order) {
      bindOrder(order);
    }
    router.replace('/(tabs)/track');
  };

  const handleBackToHome = () => {
    router.replace('/(tabs)');
  };

  if (!order) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={[styles.title, typography.h2]}>Order Confirmed</Text>
        <Button title="Go to Home" onPress={handleBackToHome} style={{ marginTop: spacing.base }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Animated Success Checkmark Header */}
        <View style={styles.successHeader}>
          <Animated.View style={[styles.checkmarkCircle, shadows.md, animatedCheckmarkStyle]}>
            <Check color="#FFFFFF" size={40} strokeWidth={3.5} />
          </Animated.View>

          <Text style={[styles.title, typography.hero]}>Booking Confirmed!</Text>
          <Text style={[styles.subtitle, typography.bodyLarge]}>
            A verified courier has been assigned and is heading to the pickup point.
          </Text>

          <View style={styles.trackingCodePill}>
            <Text style={[styles.trackingCodeLabel, typography.caption]}>TRACKING ID:</Text>
            <Text style={[styles.trackingCodeValue, typography.bodyBold]}>
              {order.trackingCode}
            </Text>
          </View>
        </View>

        {/* 4-DIGIT SECURITY OTP CARD */}
        <Animated.View entering={FadeInDown.delay(150).duration(450)} style={{ marginBottom: spacing.base }}>
          <OtpSecurityCard
            pickupOtp={order.pickupOtp || '8738'}
            deliveryOtp={order.deliveryOtp || '4912'}
            currentStatus={order.status}
            trackingCode={order.trackingCode}
            driverName={order.deliveryPartner?.name}
          />
        </Animated.View>

        {/* Order Overview Card */}
        <Animated.View entering={FadeInUp.delay(200)} style={[styles.overviewCard, shadows.sm]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, typography.captionBold]}>DELIVERY SUMMARY</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={[styles.statusText, typography.micro]}>DRIVER ASSIGNED</Text>
            </View>
          </View>

          {/* Route Preview */}
          <View style={styles.routeSection}>
            <View style={styles.routePoint}>
              <View style={[styles.pointDot, { backgroundColor: colors.success }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.pointLabel, typography.caption]}>Pickup Point</Text>
                <Text style={[styles.pointAddress, typography.bodyBold]} numberOfLines={1}>
                  {order.pickupAddress.streetAddress}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <View style={[styles.pointDot, { backgroundColor: colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.pointLabel, typography.caption]}>Destination</Text>
                <Text style={[styles.pointAddress, typography.bodyBold]} numberOfLines={1}>
                  {order.dropAddress.streetAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* Parcel & Courier Info */}
          <View style={styles.parcelRow}>
            <PackageIllustration category={order.parcel.category} size={54} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[styles.parcelTitle, typography.bodyBold]}>
                {order.parcel.category.toUpperCase()} • {order.parcel.weightKg} kg
              </Text>
              <Text style={[styles.parcelDesc, typography.caption]}>
                {order.parcel.description}
              </Text>
              <Text style={[styles.etaNotice, typography.captionBold]}>
                Estimated Arrival: ~{order.fareBreakdown.estimatedMinutes} mins ({order.vehicleType.toUpperCase()})
              </Text>
            </View>
          </View>

          {/* Payment Pill */}
          <View style={styles.paymentSummaryRow}>
            <Text style={[styles.paymentLabel, typography.body]}>Amount Paid</Text>
            <Text style={[styles.paymentAmount, typography.h3]}>
              ₹{order.fareBreakdown.totalInr} ({order.payment.method.toUpperCase()})
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={[styles.footer, shadows.lg]}>
        <Button
          title="Track Order Live on Map"
          onPress={handleTrackOrder}
          icon={<Navigation color="#FFFFFF" size={18} />}
          size="lg"
          variant="primary"
          style={{ marginBottom: spacing.sm }}
        />

        <Button
          title="Back to Home"
          onPress={handleBackToHome}
          icon={<Home color={colors.textPrimary} size={18} />}
          size="md"
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: 70,
    paddingBottom: 170,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  trackingCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  trackingCodeLabel: {
    color: colors.textMuted,
    fontWeight: '800',
  },
  trackingCodeValue: {
    color: colors.primary,
    letterSpacing: 1,
  },
  overviewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  cardTitle: {
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoSoft,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.info,
  },
  statusText: {
    color: colors.infoDark,
    fontWeight: '800',
  },
  routeSection: {
    marginBottom: spacing.base,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pointLabel: {
    color: colors.textMuted,
  },
  pointAddress: {
    color: colors.textPrimary,
    marginTop: 2,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.surfaceBorder,
    marginLeft: 4,
    marginVertical: 4,
  },
  parcelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surfaceBorderLight,
  },
  parcelTitle: {
    color: colors.textPrimary,
  },
  parcelDesc: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  etaNotice: {
    color: colors.primary,
    marginTop: 4,
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.base,
  },
  paymentLabel: {
    color: colors.textSecondary,
  },
  paymentAmount: {
    color: colors.textPrimary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
});

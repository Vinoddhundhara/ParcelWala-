import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Navigation,
  Phone,
  Calendar,
  XCircle,
  Repeat,
  ShieldCheck,
  Star,
  Building,
  CheckCircle2,
  Bike,
} from 'lucide-react-native';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { PackageIllustration } from '../../src/components/illustrations/PackageIllustration';
import { StatusStepper } from '../../src/components/cards/StatusStepper';
import { OtpSecurityCard } from '../../src/components/cards/OtpSecurityCard';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useOrdersStore } from '../../src/store/useOrdersStore';
import { useBookingStore } from '../../src/store/useBookingStore';
import { useTrackingStore } from '../../src/store/useTrackingStore';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = params.id;

  const order = useOrdersStore((s) => s.getOrderById(orderId || ''));
  const bindOrder = useTrackingStore((s) => s.bindOrder);
  const setPickupAddress = useBookingStore((s) => s.setPickupAddress);
  const setDropAddress = useBookingStore((s) => s.setDropAddress);
  const setParcelDetails = useBookingStore((s) => s.setParcelDetails);
  const setServiceType = useBookingStore((s) => s.setServiceType);
  const setVehicleType = useBookingStore((s) => s.setVehicleType);

  if (!order) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={typography.h2}>Order Not Found</Text>
        <Button
          title="Back to Orders"
          onPress={() => router.replace('/(tabs)/orders')}
          style={{ marginTop: spacing.md }}
        />
      </View>
    );
  }

  const isCancellable = ['created', 'driver_assigned', 'arriving_pickup'].includes(order.status);
  const isActive = !['delivered', 'cancelled'].includes(order.status);

  const handleTrackLive = () => {
    bindOrder(order);
    router.push('/(tabs)/track');
  };

  const handleCancelOrder = () => {
    router.push({
      pathname: '/orders/cancel',
      params: { id: order.id },
    });
  };

  const handleReorder = () => {
    setPickupAddress(order.pickupAddress);
    setDropAddress(order.dropAddress);
    setParcelDetails(order.parcel);
    setServiceType(order.serviceType);
    setVehicleType(order.vehicleType || 'bike');
    router.push('/booking/review');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.textPrimary} size={22} />
          </Pressable>
          <View>
            <Text style={[styles.trackingCode, typography.h3]}>{order.trackingCode}</Text>
          </View>
          <Badge status={order.status} label={order.status.replace('_', ' ')} />
        </Animated.View>

        {/* 4-Digit Security OTP Card */}
        {isActive && (
          <Animated.View entering={FadeInDown.delay(100).duration(450)}>
            <OtpSecurityCard
              pickupOtp={order.pickupOtp || '8738'}
              deliveryOtp={order.deliveryOtp || '4912'}
              currentStatus={order.status}
              trackingCode={order.trackingCode}
              driverName={order.deliveryPartner?.name}
            />
          </Animated.View>
        )}

        {/* Live Stepper Status Timeline */}
        <Animated.View entering={FadeInDown.delay(150).duration(450)} style={[styles.card, shadows.sm]}>
          <Text style={[styles.cardTitle, typography.captionBold]}>ORDER PROGRESS</Text>
          <StatusStepper currentStatus={order.status} />
        </Animated.View>

        {/* Delivery Partner Details (if assigned) */}
        {order.deliveryPartner && order.status !== 'cancelled' && (
          <Animated.View entering={FadeInDown.delay(200).duration(450)} style={[styles.card, shadows.sm]}>
            <Text style={[styles.cardTitle, typography.captionBold]}>ASSIGNED COURIER PARTNER</Text>
            <View style={styles.courierRow}>
              <Image source={{ uri: order.deliveryPartner.avatarUrl }} style={styles.courierAvatar} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[styles.courierName, typography.bodyBold]}>
                  {order.deliveryPartner.name}
                </Text>
                <View style={styles.ratingRow}>
                  <Star color="#F59E0B" fill="#F59E0B" size={14} />
                  <Text style={[styles.ratingText, typography.captionBold]}>
                    {order.deliveryPartner.rating} ({order.deliveryPartner.totalDeliveries}+ trips)
                  </Text>
                </View>
                <Text style={[styles.vehicleText, typography.caption]}>
                  {order.deliveryPartner.vehicleNumber} • {order.deliveryPartner.vehicleType}
                </Text>
              </View>

              {isActive && (
                <Pressable
                  style={styles.callCourierBtn}
                  onPress={() =>
                    Alert.alert(
                      'Call Courier Partner',
                      `Connecting call to ${order.deliveryPartner?.name} (${order.deliveryPartner?.phone})`
                    )
                  }
                  accessibilityLabel="Call delivery partner"
                >
                  <Phone color="#FFFFFF" size={18} />
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}

        {/* Route Details */}
        <Animated.View entering={FadeInDown.delay(250).duration(450)} style={[styles.card, shadows.sm]}>
          <Text style={[styles.cardTitle, typography.captionBold]}>ADDRESS DETAILS</Text>

          {/* Pickup */}
          <View style={styles.addressItem}>
            <View style={[styles.pointCircle, { backgroundColor: colors.success }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.pointLabel, typography.captionBold]}>Pickup From</Text>
              <Text style={[styles.pointStreet, typography.bodyBold]}>
                {order.pickupAddress.streetAddress}
              </Text>
              <Text style={[styles.pointContact, typography.caption]}>
                {order.pickupAddress.contactName} (+91 {order.pickupAddress.contactPhone})
              </Text>
            </View>
          </View>

          <View style={styles.dottedDivider} />

          {/* Drop */}
          <View style={styles.addressItem}>
            <View style={[styles.pointCircle, { backgroundColor: colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.pointLabel, typography.captionBold]}>Deliver To</Text>
              <Text style={[styles.pointStreet, typography.bodyBold]}>
                {order.dropAddress.streetAddress}
              </Text>
              <Text style={[styles.pointContact, typography.caption]}>
                {order.dropAddress.contactName} (+91 {order.dropAddress.contactPhone})
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Parcel Details */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)} style={[styles.card, shadows.sm]}>
          <Text style={[styles.cardTitle, typography.captionBold]}>PARCEL & VEHICLE INFORMATION</Text>
          <View style={styles.parcelRow}>
            <PackageIllustration category={order.parcel.category} size={60} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[styles.parcelCategoryText, typography.bodyBold]}>
                {order.parcel.category.toUpperCase()} • {order.parcel.weightKg} kg
              </Text>
              <Text style={[styles.parcelDesc, typography.body]}>
                {order.parcel.description}
              </Text>
              <Text style={[styles.parcelDims, typography.caption]}>
                Dimensions: {order.parcel.lengthCm} × {order.parcel.widthCm} × {order.parcel.heightCm} cm
              </Text>
              <Text style={[styles.parcelVehicleText, typography.captionBold]}>
                Vehicle: {order.vehicleType.toUpperCase()} • {order.serviceType.toUpperCase()}
              </Text>
            </View>
          </View>

          {order.parcel.photoUri && (
            <View style={styles.photoContainer}>
              <Text style={[styles.photoLabel, typography.captionBold]}>Attached Photo</Text>
              <Image source={{ uri: order.parcel.photoUri }} style={styles.attachedPhoto} />
            </View>
          )}
        </Animated.View>

        {/* Payment Summary */}
        <Animated.View entering={FadeInDown.delay(350).duration(450)} style={[styles.card, shadows.sm]}>
          <Text style={[styles.cardTitle, typography.captionBold]}>PAYMENT BREAKDOWN</Text>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, typography.body]}>Base Fare</Text>
            <Text style={[styles.paymentValue, typography.body]}>₹{order.fareBreakdown.baseFare}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, typography.body]}>
              Distance Charge ({order.fareBreakdown.distanceKm} km)
            </Text>
            <Text style={[styles.paymentValue, typography.body]}>
              ₹{order.fareBreakdown.distanceCharge}
            </Text>
          </View>
          {order.fareBreakdown.vehicleSurcharge ? (
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, typography.body]}>Vehicle Tier Charge</Text>
              <Text style={[styles.paymentValue, typography.body]}>
                + ₹{order.fareBreakdown.vehicleSurcharge}
              </Text>
            </View>
          ) : null}
          {order.fareBreakdown.insuranceFeeInr ? (
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, typography.body]}>Transit Protection Cover</Text>
              <Text style={[styles.paymentValue, typography.body]}>
                + ₹{order.fareBreakdown.insuranceFeeInr}
              </Text>
            </View>
          ) : null}
          {order.fareBreakdown.tipAmountInr ? (
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, typography.body]}>Delivery Hero Tip</Text>
              <Text style={[styles.paymentValue, typography.body]}>
                + ₹{order.fareBreakdown.tipAmountInr}
              </Text>
            </View>
          ) : null}
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, typography.body]}>GST & Taxes (18%)</Text>
            <Text style={[styles.paymentValue, typography.body]}>₹{order.fareBreakdown.taxGst}</Text>
          </View>
          {order.fareBreakdown.discount > 0 && (
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.successDark }]}>Discount</Text>
              <Text style={[styles.paymentValue, { color: colors.successDark }]}>
                - ₹{order.fareBreakdown.discount}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, typography.h3]}>Total Amount</Text>
            <Text style={[styles.totalAmount, typography.h2]}>
              ₹{order.fareBreakdown.totalInr}
            </Text>
          </View>

          <View style={styles.paymentStatusRow}>
            <CheckCircle2 color={colors.success} size={16} />
            <Text style={[styles.paymentStatusText, typography.caption]}>
              Paid via {order.payment.method.toUpperCase()} • ID: {order.payment.transactionId || 'PG_TXN_LIVE'}
            </Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {isActive ? (
            <>
              <Button
                title="Track Live on Map"
                onPress={handleTrackLive}
                size="lg"
                variant="primary"
                icon={<Navigation color="#FFFFFF" size={18} />}
              />
              {isCancellable && (
                <Button
                  title="Cancel Booking"
                  onPress={handleCancelOrder}
                  size="md"
                  variant="outline"
                  style={{ marginTop: spacing.sm, borderColor: colors.danger }}
                  textStyle={{ color: colors.danger }}
                />
              )}
            </>
          ) : (
            <Button
              title="Repeat This Booking"
              onPress={handleReorder}
              size="lg"
              variant="primary"
              icon={<Repeat color="#FFFFFF" size={18} />}
            />
          )}
        </View>
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
    paddingBottom: 60,
    gap: spacing.base,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  trackingCode: {
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
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courierAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.primarySoft,
  },
  courierName: {
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    color: colors.warningDark,
  },
  vehicleText: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  callCourierBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressItem: {
    flexDirection: 'row',
    gap: 12,
  },
  pointCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  pointLabel: {
    color: colors.textMuted,
  },
  pointStreet: {
    color: colors.textPrimary,
    marginTop: 2,
  },
  pointContact: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  dottedDivider: {
    height: 24,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
    marginVertical: 4,
  },
  parcelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parcelCategoryText: {
    color: colors.textPrimary,
  },
  parcelDesc: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  parcelDims: {
    color: colors.textMuted,
    marginTop: 4,
  },
  parcelVehicleText: {
    color: colors.primary,
    marginTop: 4,
  },
  photoContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  photoLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  attachedPhoto: {
    width: '100%',
    height: 160,
    borderRadius: borderRadius.lg,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  paymentLabel: {
    color: colors.textSecondary,
  },
  paymentValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: colors.textPrimary,
  },
  totalAmount: {
    color: colors.primary,
  },
  paymentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  paymentStatusText: {
    color: colors.successDark,
  },
  actionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});

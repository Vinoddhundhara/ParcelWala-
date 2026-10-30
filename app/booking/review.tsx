import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  MapPin,
  Package,
  Edit2,
  Tag,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Info,
  Heart,
  ShieldCheck,
  Bike,
} from 'lucide-react-native';
import { Button } from '../../src/components/common/Button';
import { AnimatedCounter } from '../../src/components/animations/AnimatedCounter';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useBookingStore } from '../../src/store/useBookingStore';
import { PackageIllustration } from '../../src/components/illustrations/PackageIllustration';

export default function BookingReviewScreen() {
  const router = useRouter();
  const pickupAddress = useBookingStore((s) => s.pickupAddress);
  const dropAddress = useBookingStore((s) => s.dropAddress);
  const parcel = useBookingStore((s) => s.parcel);
  const serviceType = useBookingStore((s) => s.serviceType);
  const vehicleType = useBookingStore((s) => s.vehicleType);
  const insuranceOptIn = useBookingStore((s) => s.insuranceOptIn);
  const tipAmountInr = useBookingStore((s) => s.tipAmountInr);
  const setTipAmount = useBookingStore((s) => s.setTipAmount);
  const schedule = useBookingStore((s) => s.schedule);
  const quote = useBookingStore((s) => s.quote);
  const applyCoupon = useBookingStore((s) => s.applyCoupon);
  const removeCoupon = useBookingStore((s) => s.removeCoupon);
  const idempotencyKey = useBookingStore((s) => s.idempotencyKey);

  const [couponInput, setCouponInput] = useState('');
  const [selectedTip, setSelectedTip] = useState<number>(tipAmountInr);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  const tipOptions = [0, 10, 20, 30, 50];

  const handleSelectTip = (amount: number) => {
    setSelectedTip(amount);
    setTipAmount(amount);
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput.trim());
    if (success) {
      setCouponMessage({ text: 'Coupon applied successfully!', isError: false });
    } else {
      setCouponMessage({
        text: 'Invalid or expired coupon. Try PARCELGO50 or FIRSTFREE.',
        isError: true,
      });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    setCouponMessage(null);
  };

  const handleProceedToPayment = () => {
    router.push('/booking/payment');
  };

  if (!pickupAddress || !dropAddress || !quote) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle color={colors.danger} size={36} />
        <Text style={[styles.errorTitle, typography.h2]}>Booking Incomplete</Text>
        <Text style={[styles.errorSubtitle, typography.body]}>
          Please complete pickup and drop addresses first.
        </Text>
        <Button
          title="Return to Pickup"
          onPress={() => router.replace('/booking/pickup')}
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.textPrimary} size={22} />
          </Pressable>

          <View style={styles.stepBadge}>
            <Text style={[styles.stepBadgeText, typography.micro]}>STEP 5 OF 5</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.titleSection}>
          <Text style={[styles.title, typography.h1]}>Review & Confirm</Text>
          <Text style={[styles.subtitle, typography.body]}>
            Verify addresses and check transparent price breakdown before payment.
          </Text>
        </Animated.View>

        {/* 4-Digit Security OTP Preview Notice */}
        <Animated.View entering={FadeInDown.delay(150).duration(450)} style={styles.securityNoticeCard}>
          <ShieldCheck color="#10B981" size={20} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.securityNoticeTitle, typography.captionBold]}>
              4-Digit Secure Handover Protection
            </Text>
            <Text style={[styles.securityNoticeSub, typography.micro]}>
              You will receive separate Pickup and Delivery 4-digit PINs once booking is confirmed.
            </Text>
          </View>
        </Animated.View>

        {/* Addresses Summary Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(450)} style={[styles.summaryCard, shadows.sm]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardHeaderTitle, typography.captionBold]}>ROUTE SUMMARY</Text>
          </View>

          {/* Pickup Node */}
          <View style={styles.addressNode}>
            <View style={styles.pickupPinWrap}>
              <View style={styles.pickupPinDot} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nodeHeaderRow}>
                <Text style={[styles.nodeRole, typography.captionBold]}>Pickup From</Text>
                <Pressable
                  onPress={() => router.push('/booking/pickup')}
                  style={styles.editBtn}
                  hitSlop={8}
                >
                  <Edit2 color={colors.primary} size={14} />
                  <Text style={[styles.editText, typography.captionBold]}>Edit</Text>
                </Pressable>
              </View>
              <Text style={[styles.nodeStreet, typography.bodyBold]}>
                {pickupAddress.streetAddress}
              </Text>
              <Text style={[styles.nodeContact, typography.caption]}>
                {pickupAddress.contactName} • +91 {pickupAddress.contactPhone}
              </Text>
            </View>
          </View>

          <View style={styles.routeDottedDivider} />

          {/* Drop Node */}
          <View style={styles.addressNode}>
            <View style={styles.dropPinWrap}>
              <View style={styles.dropPinDot} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nodeHeaderRow}>
                <Text style={[styles.nodeRole, typography.captionBold]}>Deliver To</Text>
                <Pressable
                  onPress={() => router.push('/booking/drop')}
                  style={styles.editBtn}
                  hitSlop={8}
                >
                  <Edit2 color={colors.primary} size={14} />
                  <Text style={[styles.editText, typography.captionBold]}>Edit</Text>
                </Pressable>
              </View>
              <Text style={[styles.nodeStreet, typography.bodyBold]}>
                {dropAddress.streetAddress}
              </Text>
              <Text style={[styles.nodeContact, typography.caption]}>
                {dropAddress.contactName} • +91 {dropAddress.contactPhone}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Parcel & Speed Details Card */}
        <Animated.View entering={FadeInDown.delay(250).duration(450)} style={[styles.summaryCard, shadows.sm]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardHeaderTitle, typography.captionBold]}>PACKAGE & FLEET</Text>
            <Pressable
              onPress={() => router.push('/booking/parcel')}
              style={styles.editBtn}
              hitSlop={8}
            >
              <Edit2 color={colors.primary} size={14} />
              <Text style={[styles.editText, typography.captionBold]}>Edit</Text>
            </Pressable>
          </View>

          <View style={styles.parcelRow}>
            <PackageIllustration category={parcel.category} size={64} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[styles.parcelTitle, typography.bodyBold]}>
                {parcel.category.toUpperCase()} • {parcel.weightKg} kg
              </Text>
              <Text style={[styles.parcelDesc, typography.caption]}>
                {parcel.description || 'General parcel contents'}
              </Text>
              <Text style={[styles.parcelService, typography.captionBold]}>
                Vehicle: {vehicleType.toUpperCase()} • Speed: {serviceType.toUpperCase()}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Tip Your Delivery Hero (Porter / Blinkit Feature) */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)} style={[styles.tipCard, shadows.sm]}>
          <View style={styles.tipHeader}>
            <Heart color="#EC4899" fill="#EC4899" size={18} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.tipTitle, typography.captionBold]}>
                Tip Your Delivery Partner
              </Text>
              <Text style={[styles.tipSub, typography.micro]}>
                100% of this tip goes directly to your rider.
              </Text>
            </View>
          </View>

          <View style={styles.tipRow}>
            {tipOptions.map((tip) => (
              <Pressable
                key={tip}
                style={[
                  styles.tipPill,
                  selectedTip === tip && styles.tipPillActive,
                ]}
                onPress={() => handleSelectTip(tip)}
              >
                <Text
                  style={[
                    styles.tipPillText,
                    typography.captionBold,
                    selectedTip === tip && { color: '#FFFFFF' },
                  ]}
                >
                  {tip === 0 ? 'No tip' : `₹${tip}`}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Promo Code Input Box */}
        <Animated.View entering={FadeInDown.delay(350).duration(450)} style={[styles.couponCard, shadows.sm]}>
          <View style={styles.couponInputRow}>
            <Tag color={colors.primary} size={20} style={{ marginRight: spacing.sm }} />
            <TextInput
              style={[styles.couponInput, typography.bodyBold]}
              placeholder="Enter promo code (e.g. PARCELGO50)"
              placeholderTextColor={colors.textMuted}
              value={couponInput}
              onChangeText={setCouponInput}
              autoCapitalize="characters"
            />
            {quote.discount > 0 ? (
              <Pressable onPress={handleRemoveCoupon} style={styles.removeCouponBtn}>
                <Text style={[styles.removeCouponText, typography.captionBold]}>Remove</Text>
              </Pressable>
            ) : (
              <Pressable onPress={handleApplyCoupon} style={styles.applyCouponBtn}>
                <Text style={[styles.applyCouponText, typography.captionBold]}>Apply</Text>
              </Pressable>
            )}
          </View>
          {couponMessage && (
            <Text
              style={[
                styles.couponMsg,
                typography.caption,
                { color: couponMessage.isError ? colors.danger : colors.success },
              ]}
            >
              {couponMessage.text}
            </Text>
          )}
        </Animated.View>

        {/* Transparent Fare Breakdown */}
        <Animated.View entering={FadeInDown.delay(400).duration(450)} style={[styles.fareCard, shadows.sm]}>
          <Text style={[styles.cardHeaderTitle, typography.captionBold]}>
            PRICE BREAKDOWN (INR)
          </Text>

          <View style={styles.devEstimatorBadge}>
            <Info color={colors.info} size={14} style={{ marginRight: 6 }} />
            <Text style={[styles.devEstimatorText, typography.micro]}>
              Distance: {quote.distanceKm} km (Development Road Estimator)
            </Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, typography.body]}>Base Fare</Text>
            <Text style={[styles.fareValue, typography.body]}>₹{quote.baseFare}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, typography.body]}>
              Distance Rate (₹8 × {quote.distanceKm} km)
            </Text>
            <Text style={[styles.fareValue, typography.body]}>₹{quote.distanceCharge}</Text>
          </View>

          {quote.vehicleSurcharge ? (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, typography.body]}>
                Vehicle Tier Charge ({vehicleType})
              </Text>
              <Text style={[styles.fareValue, typography.body]}>+ ₹{quote.vehicleSurcharge}</Text>
            </View>
          ) : null}

          {quote.insuranceFeeInr ? (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, typography.body]}>Transit Protection Cover</Text>
              <Text style={[styles.fareValue, typography.body]}>+ ₹{quote.insuranceFeeInr}</Text>
            </View>
          ) : null}

          {selectedTip > 0 ? (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, typography.body]}>Delivery Hero Tip</Text>
              <Text style={[styles.fareValue, typography.body]}>+ ₹{selectedTip}</Text>
            </View>
          ) : null}

          {quote.weightSurcharge > 0 && (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, typography.body]}>Excess Weight Charge</Text>
              <Text style={[styles.fareValue, typography.body]}>+ ₹{quote.weightSurcharge}</Text>
            </View>
          )}

          {quote.sizeSurcharge > 0 && (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, typography.body]}>Package Handling Surcharge</Text>
              <Text style={[styles.fareValue, typography.body]}>+ ₹{quote.sizeSurcharge}</Text>
            </View>
          )}

          {quote.serviceSurcharge > 0 && (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, typography.body]}>
                {serviceType === 'express' ? 'Express Priority Fee' : 'Scheduled Slot Reservation'}
              </Text>
              <Text style={[styles.fareValue, typography.body]}>+ ₹{quote.serviceSurcharge}</Text>
            </View>
          )}

          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, typography.body]}>Platform Fee</Text>
            <Text style={[styles.fareValue, typography.body]}>₹{quote.platformFee}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, typography.body]}>GST & Operational Tax (18%)</Text>
            <Text style={[styles.fareValue, typography.body]}>₹{quote.taxGst}</Text>
          </View>

          {quote.discount > 0 && (
            <View style={styles.fareRow}>
              <Text style={[styles.discountLabel, typography.bodyBold]}>
                Discount ({quote.couponCode})
              </Text>
              <Text style={[styles.discountValue, typography.bodyBold]}>- ₹{quote.discount}</Text>
            </View>
          )}

          <View style={styles.fareDivider} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, typography.h3]}>Total Payable</Text>
            <AnimatedCounter
              value={quote.totalInr}
              prefix="₹"
              style={{ color: colors.primary, fontWeight: '800' }}
            />
          </View>
        </Animated.View>

        {/* Cancellation Policy Disclosure */}
        <View style={styles.policyCard}>
          <ShieldAlert color={colors.textSecondary} size={18} style={{ marginRight: spacing.sm }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.policyTitle, typography.captionBold]}>Free Cancellation</Text>
            <Text style={[styles.policyText, typography.caption]}>
              100% full refund if cancelled before the courier arrives at the pickup address.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, shadows.lg]}>
        <View style={styles.footerPriceRow}>
          <View>
            <Text style={[styles.footerTotalLabel, typography.caption]}>TOTAL FARE</Text>
            <Text style={[styles.footerTotalAmount, typography.h2]}>₹{quote.totalInr}</Text>
          </View>

          <Button
            title="Proceed to Payment"
            onPress={handleProceedToPayment}
            size="lg"
            variant="primary"
            style={{ flex: 1, marginLeft: spacing.base }}
          />
        </View>
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
    paddingTop: 54,
    paddingBottom: 120,
    gap: spacing.base,
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
  stepBadge: {
    backgroundColor: colors.primarySoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
  },
  stepBadgeText: {
    color: colors.primary,
    fontWeight: '800',
  },
  titleSection: {
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  securityNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: spacing.sm,
  },
  securityNoticeTitle: {
    color: colors.successDark,
  },
  securityNoticeSub: {
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  cardHeaderTitle: {
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  addressNode: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pickupPinWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  pickupPinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  dropPinWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  dropPinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  nodeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nodeRole: {
    color: colors.textMuted,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    color: colors.primary,
  },
  nodeStreet: {
    color: colors.textPrimary,
    marginTop: 2,
  },
  nodeContact: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  routeDottedDivider: {
    height: 24,
    width: 2,
    backgroundColor: colors.surfaceBorder,
    marginLeft: 11,
    marginVertical: 4,
  },
  parcelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parcelTitle: {
    color: colors.textPrimary,
  },
  parcelDesc: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  parcelService: {
    color: colors.primary,
    marginTop: 4,
  },
  tipCard: {
    backgroundColor: '#FDF2F8',
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    color: colors.textPrimary,
  },
  tipSub: {
    color: colors.textSecondary,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F472B6',
  },
  tipPillActive: {
    backgroundColor: '#DB2777',
    borderColor: '#DB2777',
  },
  tipPillText: {
    color: '#9D174D',
  },
  couponCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  applyCouponBtn: {
    backgroundColor: colors.primarySoft,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
  },
  applyCouponText: {
    color: colors.primary,
  },
  removeCouponBtn: {
    backgroundColor: colors.dangerSoft,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
  },
  removeCouponText: {
    color: colors.danger,
  },
  couponMsg: {
    marginTop: spacing.xs,
  },
  fareCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.sm,
  },
  devEstimatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoSoft,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  devEstimatorText: {
    color: colors.infoDark,
    fontWeight: '700',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    color: colors.textSecondary,
  },
  fareValue: {
    color: colors.textPrimary,
  },
  discountLabel: {
    color: colors.successDark,
  },
  discountValue: {
    color: colors.successDark,
  },
  fareDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: colors.textPrimary,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  policyTitle: {
    color: colors.textPrimary,
  },
  policyText: {
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTotalLabel: {
    color: colors.textMuted,
  },
  footerTotalAmount: {
    color: colors.textPrimary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  errorSubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

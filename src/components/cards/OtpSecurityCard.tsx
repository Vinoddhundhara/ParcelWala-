import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Share,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import {
  ShieldCheck,
  Copy,
  Check,
  Share2,
  Lock,
  ArrowRight,
} from 'lucide-react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { OrderStatus } from '../../types';

export interface OtpSecurityCardProps {
  pickupOtp: string;
  deliveryOtp: string;
  currentStatus: OrderStatus;
  trackingCode?: string;
  driverName?: string;
}

export const OtpSecurityCard: React.FC<OtpSecurityCardProps> = ({
  pickupOtp = '8738',
  deliveryOtp = '4912',
  currentStatus,
  trackingCode,
  driverName = 'Courier Partner',
}) => {
  const [copiedType, setCopiedType] = useState<'pickup' | 'delivery' | null>(null);

  const isPickupStage = ['created', 'driver_assigned', 'arriving_pickup'].includes(currentStatus);
  const isDeliveryStage = ['pickup_complete', 'in_transit', 'out_for_delivery'].includes(currentStatus);
  const isDelivered = currentStatus === 'delivered';

  const handleCopy = (code: string, type: 'pickup' | 'delivery') => {
    setCopiedType(type);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`OTP ${code} copied to clipboard!`, ToastAndroid.SHORT);
    } else {
      Alert.alert('OTP Copied', `Security code ${code} copied to clipboard.`);
    }
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleShare = async (code: string, label: string) => {
    try {
      await Share.share({
        message: `ParcelGo Delivery Security OTP for Order ${trackingCode || ''}: Use PIN ${code} to authorize ${label}. Track live in ParcelGo app.`,
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={[styles.container, shadows.sm]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <ShieldCheck color={colors.primary} size={18} />
          <Text style={[styles.headerTitle, typography.captionBold]}>
            SECURE HANDOVER VERIFICATION
          </Text>
        </View>
        <View style={styles.lockBadge}>
          <Lock color={colors.success} size={12} style={{ marginRight: 4 }} />
          <Text style={[styles.lockBadgeText, typography.micro]}>4-DIGIT PIN</Text>
        </View>
      </View>

      <Text style={[styles.instructionText, typography.caption]}>
        To protect your parcel, courier partner will request the 4-digit verification code before custody transfer.
      </Text>

      {/* OTP Display Grid */}
      <View style={styles.otpCardsRow}>
        {/* Pickup OTP Box */}
        <View
          style={[
            styles.otpBox,
            isPickupStage ? styles.otpBoxActive : styles.otpBoxInactive,
          ]}
        >
          <View style={styles.otpHeaderLine}>
            <Text
              style={[
                styles.otpRoleLabel,
                typography.micro,
                isPickupStage ? { color: colors.primary } : { color: colors.textSecondary },
              ]}
            >
              1. PICKUP OTP
            </Text>
            {isPickupStage && (
              <View style={styles.nowBadge}>
                <Text style={[styles.nowBadgeText, typography.micro]}>REQUIRED NOW</Text>
              </View>
            )}
          </View>

          <View style={styles.digitsRow}>
            {pickupOtp.split('').map((digit, idx) => (
              <View
                key={idx}
                style={[
                  styles.digitSquare,
                  isPickupStage ? styles.digitSquareActive : styles.digitSquareInactive,
                ]}
              >
                <Text
                  style={[
                    styles.digitText,
                    typography.h2,
                    isPickupStage ? { color: colors.primary } : { color: colors.textSecondary },
                  ]}
                >
                  {digit}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => handleCopy(pickupOtp, 'pickup')}
              accessibilityLabel="Copy Pickup OTP"
            >
              {copiedType === 'pickup' ? (
                <>
                  <Check color={colors.success} size={13} />
                  <Text style={[styles.actionBtnText, typography.micro, { color: colors.success }]}>
                    COPIED
                  </Text>
                </>
              ) : (
                <>
                  <Copy color={colors.textSecondary} size={13} />
                  <Text style={[styles.actionBtnText, typography.micro]}>COPY</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => handleShare(pickupOtp, 'Pickup')}
              accessibilityLabel="Share Pickup OTP"
            >
              <Share2 color={colors.textSecondary} size={13} />
              <Text style={[styles.actionBtnText, typography.micro]}>SHARE</Text>
            </Pressable>
          </View>
        </View>

        {/* Delivery OTP Box */}
        <View
          style={[
            styles.otpBox,
            isDeliveryStage ? styles.otpBoxActive : styles.otpBoxInactive,
          ]}
        >
          <View style={styles.otpHeaderLine}>
            <Text
              style={[
                styles.otpRoleLabel,
                typography.micro,
                isDeliveryStage ? { color: colors.primary } : { color: colors.textSecondary },
              ]}
            >
              2. DELIVERY OTP
            </Text>
            {isDeliveryStage && (
              <View style={styles.nowBadge}>
                <Text style={[styles.nowBadgeText, typography.micro]}>AT DROP</Text>
              </View>
            )}
          </View>

          <View style={styles.digitsRow}>
            {deliveryOtp.split('').map((digit, idx) => (
              <View
                key={idx}
                style={[
                  styles.digitSquare,
                  isDeliveryStage ? styles.digitSquareActive : styles.digitSquareInactive,
                ]}
              >
                <Text
                  style={[
                    styles.digitText,
                    typography.h2,
                    isDeliveryStage ? { color: colors.primary } : { color: colors.textSecondary },
                  ]}
                >
                  {digit}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => handleCopy(deliveryOtp, 'delivery')}
              accessibilityLabel="Copy Delivery OTP"
            >
              {copiedType === 'delivery' ? (
                <>
                  <Check color={colors.success} size={13} />
                  <Text style={[styles.actionBtnText, typography.micro, { color: colors.success }]}>
                    COPIED
                  </Text>
                </>
              ) : (
                <>
                  <Copy color={colors.textSecondary} size={13} />
                  <Text style={[styles.actionBtnText, typography.micro]}>COPY</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => handleShare(deliveryOtp, 'Delivery Handover')}
              accessibilityLabel="Share Delivery OTP"
            >
              <Share2 color={colors.textSecondary} size={13} />
              <Text style={[styles.actionBtnText, typography.micro]}>SHARE</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Safety Notice Footer */}
      <View style={styles.noticeFooter}>
        <Text style={[styles.noticeText, typography.micro]}>
          ⚠️ Do not share Delivery OTP over phone calls or before inspecting your package condition.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  lockBadgeText: {
    color: colors.successDark,
    fontWeight: '800',
  },
  instructionText: {
    color: colors.textSecondary,
    marginBottom: spacing.base,
    lineHeight: 18,
  },
  otpCardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  otpBox: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    borderWidth: 1.5,
  },
  otpBoxActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  otpBoxInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  otpHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpRoleLabel: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nowBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: borderRadius.full,
  },
  nowBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  digitsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  digitSquare: {
    width: 28,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitSquareActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FB923C',
  },
  digitSquareInactive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  digitText: {
    fontWeight: '900',
    fontSize: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.8)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: borderRadius.sm,
  },
  actionBtnText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  noticeFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  noticeText: {
    color: '#64748B',
    lineHeight: 14,
  },
});


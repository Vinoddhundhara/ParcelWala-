import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react-native';
import { Input } from '../../src/components/forms/Input';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useOrdersStore } from '../../src/store/useOrdersStore';

export default function CancelOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = params.id;

  const order = useOrdersStore((s) => s.getOrderById(orderId || ''));
  const cancelOrder = useOrdersStore((s) => s.cancelOrder);

  const [selectedReason, setSelectedReason] = useState<string>('Changed my mind');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reasons = [
    'Changed my mind',
    'Entered incorrect delivery address',
    'Courier arrival delayed',
    'Found alternate shipping option',
    'Booked duplicate order by mistake',
    'Other reason',
  ];

  const handleConfirmCancel = async () => {
    if (!order) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const reasonText =
        additionalNotes.trim()
          ? `${selectedReason}: ${additionalNotes.trim()}`
          : selectedReason;

      const result = await cancelOrder(order.id, reasonText);
      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      router.replace({
        pathname: '/orders/[id]',
        params: { id: order.id },
      });
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage((err as Error)?.message || 'Failed to cancel order.');
    }
  };

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

  const refundAmount = order.payment.status === 'completed' ? order.fareBreakdown.totalInr : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.textPrimary} size={22} />
          </Pressable>
          <Text style={[styles.headerTitle, typography.h3]}>Cancel Delivery</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Warning Alert Banner */}
        <View style={styles.warningCard}>
          <AlertTriangle color={colors.warning} size={24} style={{ marginRight: spacing.sm }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.warningTitle, typography.bodyBold]}>
              Are you sure you want to cancel?
            </Text>
            <Text style={[styles.warningText, typography.caption]}>
              Your courier partner will be unassigned and notified immediately.
            </Text>
          </View>
        </View>

        {/* Refund Policy Summary */}
        <View style={[styles.refundCard, shadows.sm]}>
          <Text style={[styles.refundHeading, typography.captionBold]}>REFUND BREAKDOWN</Text>
          <View style={styles.refundRow}>
            <Text style={[styles.refundLabel, typography.body]}>Amount Paid</Text>
            <Text style={[styles.refundValue, typography.bodyBold]}>
              ₹{order.fareBreakdown.totalInr}
            </Text>
          </View>
          <View style={styles.refundRow}>
            <Text style={[styles.refundLabel, typography.body]}>Cancellation Fee</Text>
            <Text style={[styles.refundValue, { color: colors.successDark }]}>₹0 (Free)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.refundRow}>
            <Text style={[styles.refundTotalLabel, typography.bodyBold]}>Total Refundable</Text>
            <Text style={[styles.refundTotalAmount, typography.h3]}>₹{refundAmount}</Text>
          </View>
          <Text style={[styles.refundMethodNotice, typography.micro]}>
            Credited back to your original payment method ({order.payment.method.toUpperCase()}).
          </Text>
        </View>

        {/* Error alert if any */}
        {errorMessage && (
          <View style={styles.errorAlert}>
            <Text style={[styles.errorAlertText, typography.bodyMedium]}>{errorMessage}</Text>
          </View>
        )}

        {/* Reason Selector */}
        <Text style={[styles.sectionTitle, typography.bodyBold]}>
          Please select a cancellation reason:
        </Text>

        <View style={styles.reasonsList}>
          {reasons.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <Pressable
                key={reason}
                style={[
                  styles.reasonOption,
                  isSelected && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleActive,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text
                  style={[
                    styles.reasonText,
                    typography.body,
                    isSelected && { color: colors.primary, fontWeight: '600' },
                  ]}
                >
                  {reason}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Additional Notes Input */}
        <Input
          label="Additional Details (Optional)"
          value={additionalNotes}
          onChangeText={setAdditionalNotes}
          placeholder="Help us improve our delivery service..."
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' }}
        />
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, shadows.lg]}>
        <Button
          title={isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
          onPress={handleConfirmCancel}
          loading={isSubmitting}
          size="lg"
          variant="danger"
          style={{ marginBottom: spacing.sm }}
        />
        <Button
          title="Keep Delivery"
          onPress={() => router.back()}
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
    paddingTop: 54,
    paddingBottom: 150,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
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
  headerTitle: {
    color: colors.textPrimary,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningSoft,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: spacing.base,
  },
  warningTitle: {
    color: colors.warningDark,
    marginBottom: 2,
  },
  warningText: {
    color: colors.warningDark,
  },
  refundCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  refundHeading: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  refundLabel: {
    color: colors.textSecondary,
  },
  refundValue: {
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.sm,
  },
  refundTotalLabel: {
    color: colors.textPrimary,
  },
  refundTotalAmount: {
    color: colors.successDark,
  },
  refundMethodNotice: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  errorAlert: {
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
  },
  errorAlertText: {
    color: colors.dangerDark,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  reasonsList: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  reasonOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  reasonText: {
    color: colors.textPrimary,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderLight,
  },
});

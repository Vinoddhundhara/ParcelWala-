import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react-native';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useBookingStore } from '../../src/store/useBookingStore';
import { useOrdersStore } from '../../src/store/useOrdersStore';
import { paymentService } from '../../src/services/payments/paymentService';
import { PaymentMethodType } from '../../src/types';

export default function PaymentScreen() {
  const router = useRouter();
  const pickupAddress = useBookingStore((s) => s.pickupAddress);
  const dropAddress = useBookingStore((s) => s.dropAddress);
  const parcel = useBookingStore((s) => s.parcel);
  const serviceType = useBookingStore((s) => s.serviceType);
  const quote = useBookingStore((s) => s.quote);
  const idempotencyKey = useBookingStore((s) => s.idempotencyKey);

  const createOrder = useOrdersStore((s) => s.createOrder);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi');
  const [testScenario, setTestScenario] = useState<'success' | 'failure' | 'cancelled'>('success');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const paymentOptions: {
    id: PaymentMethodType;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    popular?: boolean;
  }[] = [
    {
      id: 'upi',
      title: 'UPI (Fastest)',
      subtitle: 'Google Pay, PhonePe, Paytm, BHIM',
      icon: <Smartphone color={colors.primary} size={22} />,
      popular: true,
    },
    {
      id: 'card',
      title: 'Credit / Debit Card',
      subtitle: 'Visa, MasterCard, RuPay',
      icon: <CreditCard color="#3B82F6" size={22} />,
    },
    {
      id: 'netbanking',
      title: 'Net Banking',
      subtitle: 'HDFC, SBI, ICICI, Axis & all major banks',
      icon: <Building2 color="#8B5CF6" size={22} />,
    },
    {
      id: 'cod',
      title: 'Cash / UPI on Delivery',
      subtitle: 'Pay directly to delivery partner upon pickup',
      icon: <Banknote color="#10B981" size={22} />,
    },
  ];

  const handlePayNow = async () => {
    if (!pickupAddress || !dropAddress || !quote) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const paymentResult = await paymentService.processPayment({
        orderId: `ord_draft_${Date.now()}`,
        amountInr: quote.totalInr,
        method: selectedMethod,
        idempotencyKey,
        mockOutcome: testScenario,
      });

      if (paymentResult.status === 'failed') {
        setPaymentError(paymentResult.errorMessage || 'Payment processing was interrupted.');
        setIsProcessing(false);
        return;
      }

      // Create persistent order
      const newOrder = await createOrder({
        pickupAddress,
        dropAddress,
        parcel,
        serviceType,
        fareBreakdown: quote,
        payment: paymentResult,
        idempotencyKey,
      });

      setIsProcessing(false);
      router.replace({
        pathname: '/booking/confirmation',
        params: { orderId: newOrder.id },
      });
    } catch (err: unknown) {
      setIsProcessing(false);
      setPaymentError((err as Error)?.message || 'Payment failed.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.textPrimary} size={22} />
          </Pressable>

          <View style={styles.amountPill}>
            <Text style={[styles.amountPillLabel, typography.caption]}>PAYING</Text>
            <Text style={[styles.amountPillValue, typography.bodyBold]}>₹{quote?.totalInr || 0}</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.title, typography.h1]}>Select Payment Mode</Text>
          <Text style={[styles.subtitle, typography.body]}>
            All transactions are encrypted and processed through our verified gateway.
          </Text>
        </View>

        {/* Development Mock Adapter Scenario Tester */}
        <View style={[styles.scenarioCard, shadows.sm]}>
          <View style={styles.scenarioHeader}>
            <FlaskConical color={colors.info} size={18} style={{ marginRight: 6 }} />
            <Text style={[styles.scenarioTitle, typography.captionBold]}>
              DEV PAYMENT ADAPTER SIMULATOR
            </Text>
          </View>
          <Text style={[styles.scenarioDesc, typography.caption]}>
            Test gateway response scenarios without spending real money:
          </Text>

          <View style={styles.scenarioButtonGroup}>
            <Pressable
              style={[
                styles.scenarioBtn,
                testScenario === 'success' && styles.scenarioBtnSuccess,
              ]}
              onPress={() => setTestScenario('success')}
            >
              <Text
                style={[
                  styles.scenarioBtnText,
                  typography.captionBold,
                  testScenario === 'success' && { color: colors.successDark },
                ]}
              >
                Simulate Success
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.scenarioBtn,
                testScenario === 'failure' && styles.scenarioBtnFail,
              ]}
              onPress={() => setTestScenario('failure')}
            >
              <Text
                style={[
                  styles.scenarioBtnText,
                  typography.captionBold,
                  testScenario === 'failure' && { color: colors.dangerDark },
                ]}
              >
                Bank Decline
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.scenarioBtn,
                testScenario === 'cancelled' && styles.scenarioBtnCancel,
              ]}
              onPress={() => setTestScenario('cancelled')}
            >
              <Text
                style={[
                  styles.scenarioBtnText,
                  typography.captionBold,
                  testScenario === 'cancelled' && { color: colors.warningDark },
                ]}
              >
                User Cancelled
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Payment Error Alert (if any) */}
        {paymentError && (
          <View style={styles.errorAlert}>
            <AlertCircle color={colors.danger} size={20} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.errorAlertTitle, typography.bodyBold]}>Payment Not Completed</Text>
              <Text style={[styles.errorAlertText, typography.caption]}>{paymentError}</Text>
            </View>
          </View>
        )}

        {/* Payment Methods List */}
        <View style={styles.methodsList}>
          {paymentOptions.map((opt) => {
            const isSelected = selectedMethod === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[
                  styles.methodCard,
                  shadows.sm,
                  isSelected && styles.methodCardSelected,
                ]}
                onPress={() => {
                  setSelectedMethod(opt.id);
                  setPaymentError(null);
                }}
              >
                <View style={styles.iconCol}>{opt.icon}</View>
                <View style={{ flex: 1 }}>
                  <View style={styles.methodTitleRow}>
                    <Text style={[styles.methodTitle, typography.bodyBold]}>{opt.title}</Text>
                    {opt.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={[styles.popularBadgeText, typography.micro]}>POPULAR</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.methodSubtitle, typography.caption]}>{opt.subtitle}</Text>
                </View>

                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleActive,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Security Disclaimers */}
        <View style={styles.securityFooter}>
          <ShieldCheck color={colors.success} size={18} />
          <Text style={[styles.securityText, typography.caption]}>
            PCI-DSS Level 1 Compliant • End-to-End SSL Encrypted
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, shadows.lg]}>
        <Button
          title={
            isProcessing
              ? 'Processing Payment...'
              : selectedMethod === 'cod'
              ? `Confirm Booking (₹${quote?.totalInr})`
              : `Pay ₹${quote?.totalInr || 0} Securely`
          }
          onPress={handlePayNow}
          loading={isProcessing}
          size="lg"
          variant="primary"
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
    paddingBottom: 110,
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
  amountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  amountPillLabel: {
    color: colors.primaryDark,
  },
  amountPillValue: {
    color: colors.primaryDark,
  },
  titleSection: {
    marginBottom: spacing.base,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  scenarioCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scenarioTitle: {
    color: colors.infoDark,
    letterSpacing: 0.5,
  },
  scenarioDesc: {
    color: colors.infoDark,
    marginBottom: spacing.sm,
  },
  scenarioButtonGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  scenarioBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scenarioBtnSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  scenarioBtnFail: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  scenarioBtnCancel: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
  },
  scenarioBtnText: {
    color: colors.textSecondary,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorAlertTitle: {
    color: colors.dangerDark,
    marginBottom: 2,
  },
  errorAlertText: {
    color: colors.dangerDark,
  },
  methodsList: {
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  methodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  iconCol: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodTitle: {
    color: colors.textPrimary,
  },
  popularBadge: {
    backgroundColor: '#FFEDD5',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.full,
  },
  popularBadgeText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  methodSubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: spacing.md,
  },
  securityText: {
    color: colors.textSecondary,
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


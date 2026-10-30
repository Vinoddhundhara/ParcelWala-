import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react-native';
import { Input } from '../../src/components/forms/Input';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { ENV } from '../../src/config/env';
import { supportTicketSchema, getFirstZodError } from '../../src/utils/validation';
import { SupportTicketCategory } from '../../src/types';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 1,
    question: 'How is the delivery fare calculated?',
    answer:
      'Our fare engine computes a ₹30 base fare plus ₹8 per kilometre of routed road distance. Packages exceeding 1 kg have an excess weight surcharge of ₹12/kg. Express priority dispatches carry a ₹45 direct route surcharge. 18% GST is added to all taxable logistics services.',
  },
  {
    id: 2,
    question: 'What goods are prohibited from transport?',
    answer:
      'We strictly prohibit flammable or hazardous liquids, fireworks, illegal contraband, live animals, unwrapped biohazards, and unregistered firearms. All packages undergo rider visual verification before sealing.',
  },
  {
    id: 3,
    question: 'Can I cancel my delivery and get a refund?',
    answer:
      'Yes! You receive a 100% full refund if you cancel anytime before the delivery partner arrives at the pickup address. Once the package is collected and in transit, cancellation is locked to protect package integrity.',
  },
  {
    id: 4,
    question: 'How do I track my delivery partner in real time?',
    answer:
      'Open the "Track" tab in the bottom bar to view live GPS waypoints, partner vehicle speed, and estimated minutes to doorstep. In development mode, deterministic route simulation illustrates this exact workflow.',
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(1);

  // Ticket form
  const [category, setCategory] = useState<SupportTicketCategory>('billing_refund');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: { id: SupportTicketCategory; label: string }[] = [
    { id: 'billing_refund', label: 'Billing & Refund' },
    { id: 'late_delivery', label: 'Delayed Delivery' },
    { id: 'damaged_parcel', label: 'Damaged Item' },
    { id: 'driver_issue', label: 'Courier Conduct' },
    { id: 'other', label: 'Other Query' },
  ];

  const handleToggleFaq = (id: number) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const handleSubmitTicket = () => {
    const data = {
      category,
      subject,
      message,
    };

    const parse = supportTicketSchema.safeParse(data);
    if (!parse.success) {
      setError(getFirstZodError(parse.error));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSuccess(true);
      setSubject('');
      setMessage('');
    }, 800);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.textPrimary} size={22} />
          </Pressable>
          <Text style={[styles.headerTitle, typography.h3]}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Contact Helpline Cards */}
        <View style={styles.helplineRow}>
          <Pressable
            style={[styles.helplineCard, shadows.sm]}
            onPress={() =>
              Alert.alert('Customer Helpline', `Dialing ParcelGo 24/7 Support: ${ENV.SUPPORT_PHONE}`)
            }
          >
            <View style={[styles.helplineIconWrap, { backgroundColor: colors.primarySoft }]}>
              <Phone color={colors.primary} size={20} />
            </View>
            <Text style={[styles.helplineTitle, typography.bodyBold]}>Call Helpline</Text>
            <Text style={[styles.helplineSub, typography.micro]}>{ENV.SUPPORT_PHONE}</Text>
          </Pressable>

          <Pressable
            style={[styles.helplineCard, shadows.sm]}
            onPress={() =>
              Alert.alert('Email Support', `Compose email to: ${ENV.SUPPORT_EMAIL}`)
            }
          >
            <View style={[styles.helplineIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Mail color="#3B82F6" size={20} />
            </View>
            <Text style={[styles.helplineTitle, typography.bodyBold]}>Email Support</Text>
            <Text style={[styles.helplineSub, typography.micro]}>{ENV.SUPPORT_EMAIL}</Text>
          </Pressable>
        </View>

        {/* FAQs Accordion */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, typography.h3]}>Frequently Asked Questions</Text>

          <View style={styles.faqsList}>
            {FAQS.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <Pressable
                  key={faq.id}
                  style={[styles.faqCard, shadows.sm]}
                  onPress={() => handleToggleFaq(faq.id)}
                >
                  <View style={styles.faqQuestionRow}>
                    <Text style={[styles.faqQuestion, typography.bodyBold]}>
                      {faq.question}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp color={colors.primary} size={20} />
                    ) : (
                      <ChevronDown color={colors.textMuted} size={20} />
                    )}
                  </View>

                  {isExpanded && (
                    <Text style={[styles.faqAnswer, typography.body]}>{faq.answer}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Submit a Support Ticket */}
        <View style={[styles.ticketCard, shadows.sm]}>
          <Text style={[styles.ticketCardTitle, typography.h3]}>Report an Issue or Query</Text>
          <Text style={[styles.ticketCardSub, typography.caption]}>
            Our dedicated logistics team replies within 15 minutes.
          </Text>

          {ticketSuccess ? (
            <View style={styles.successBox}>
              <CheckCircle2 color={colors.success} size={32} style={{ marginBottom: 6 }} />
              <Text style={[styles.successBoxTitle, typography.bodyBold]}>
                Ticket Submitted Successfully!
              </Text>
              <Text style={[styles.successBoxSub, typography.caption]}>
                Ticket reference #PGT-{Math.floor(1000 + Math.random() * 9000)} has been created.
                We will update you via push notification.
              </Text>
              <Button
                title="Submit Another Ticket"
                onPress={() => setTicketSuccess(false)}
                size="sm"
                variant="outline"
                style={{ marginTop: spacing.md }}
              />
            </View>
          ) : (
            <View style={styles.ticketForm}>
              {error && (
                <View style={styles.errorAlert}>
                  <AlertCircle color={colors.danger} size={16} style={{ marginRight: 6 }} />
                  <Text style={[styles.errorAlertText, typography.caption]}>{error}</Text>
                </View>
              )}

              <Text style={[styles.fieldLabel, typography.bodyBold]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {categories.map((c) => {
                  const isSelected = category === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      style={[styles.catChip, isSelected && styles.catChipActive]}
                      onPress={() => setCategory(c.id)}
                    >
                      <Text
                        style={[
                          styles.catChipText,
                          typography.captionBold,
                          isSelected && { color: colors.primary },
                        ]}
                      >
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Input
                label="Subject *"
                value={subject}
                onChangeText={setSubject}
                placeholder="e.g. Refund status for order PG-102934"
              />

              <Input
                label="Message Details *"
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue or question in detail..."
                multiline
                numberOfLines={4}
                style={{ height: 90, textAlignVertical: 'top' }}
              />

              <Button
                title={isSubmitting ? 'Submitting Ticket...' : 'Send Message'}
                onPress={handleSubmitTicket}
                loading={isSubmitting}
                icon={<Send color="#FFFFFF" size={16} />}
                variant="primary"
                size="md"
              />
            </View>
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
    paddingBottom: 40,
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
  helplineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  helplineCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  helplineIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  helplineTitle: {
    color: colors.textPrimary,
    marginBottom: 2,
  },
  helplineSub: {
    color: colors.textMuted,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeading: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  faqsList: {
    gap: spacing.sm,
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    color: colors.textPrimary,
    flex: 1,
    paddingRight: spacing.sm,
  },
  faqAnswer: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderLight,
  },
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xl,
  },
  ticketCardTitle: {
    color: colors.textPrimary,
    marginBottom: 2,
  },
  ticketCardSub: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  ticketForm: {
    width: '100%',
  },
  fieldLabel: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  catChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginRight: spacing.sm,
  },
  catChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  catChipText: {
    color: colors.textSecondary,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  errorAlertText: {
    color: colors.dangerDark,
  },
  successBox: {
    backgroundColor: colors.successSoft,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  successBoxTitle: {
    color: colors.successDark,
    textAlign: 'center',
  },
  successBoxSub: {
    color: colors.successDark,
    textAlign: 'center',
    marginTop: 4,
  },
});

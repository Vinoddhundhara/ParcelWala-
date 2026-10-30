import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Zap,
  Clock,
  Calendar,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react-native';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useBookingStore } from '../../src/store/useBookingStore';
import { ServiceType } from '../../src/types';

export default function DeliveryOptionsScreen() {
  const router = useRouter();
  const serviceType = useBookingStore((s) => s.serviceType);
  const setServiceType = useBookingStore((s) => s.setServiceType);
  const setSchedule = useBookingStore((s) => s.setSchedule);
  const quote = useBookingStore((s) => s.quote);

  const [selectedService, setSelectedService] = useState<ServiceType>(serviceType || 'standard');
  const [selectedSlot, setSelectedSlot] = useState('02:00 PM - 04:00 PM');
  const [selectedDate, setSelectedDate] = useState('Today, 29 Oct');

  const options: {
    id: ServiceType;
    title: string;
    badge?: string;
    eta: string;
    priceTag: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'standard',
      title: 'Standard Delivery',
      eta: '~40 mins',
      priceTag: 'Base Fare',
      description: 'Reliable doorstep courier dispatch at standard economical rates.',
      icon: <Clock color={colors.primary} size={24} />,
    },
    {
      id: 'express',
      title: 'Express Priority',
      badge: 'FASTEST',
      eta: '~20 mins',
      priceTag: '+ ₹45',
      description: 'Direct point-to-point courier transit without multi-stop batching.',
      icon: <Zap color="#FF5E00" size={24} />,
    },
    {
      id: 'scheduled',
      title: 'Scheduled Slot',
      eta: 'Pick Window',
      priceTag: '+ ₹15',
      description: 'Choose a dedicated 2-hour window that fits the receiver\'s convenience.',
      icon: <Calendar color="#8B5CF6" size={24} />,
    },
  ];

  const timeSlots = [
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
    'Tomorrow Morning (09 AM - 11 AM)',
  ];

  const handleContinue = () => {
    setServiceType(selectedService);
    if (selectedService === 'scheduled') {
      setSchedule({
        date: selectedDate,
        timeSlot: selectedSlot,
      });
    } else {
      setSchedule(undefined);
    }
    router.push('/booking/review');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.textPrimary} size={22} />
          </Pressable>

          <View style={styles.stepBadge}>
            <Text style={[styles.stepBadgeText, typography.micro]}>STEP 4 OF 5</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.title, typography.h1]}>Choose Delivery Speed</Text>
          <Text style={[styles.subtitle, typography.body]}>
            Select how urgently you want your parcel collected and delivered.
          </Text>
        </View>

        {/* Options Cards */}
        <View style={styles.optionsList}>
          {options.map((opt) => {
            const isSelected = selectedService === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[
                  styles.optionCard,
                  shadows.sm,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedService(opt.id)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconWrap}>{opt.icon}</View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.cardTitle, typography.h3]}>{opt.title}</Text>
                      {opt.badge && (
                        <View style={styles.fastBadge}>
                          <Text style={[styles.fastBadgeText, typography.micro]}>
                            {opt.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.cardEta, typography.captionBold]}>
                      Estimated transit: {opt.eta}
                    </Text>
                  </View>

                  <View style={styles.priceWrap}>
                    <Text style={[styles.priceTag, typography.bodyBold]}>{opt.priceTag}</Text>
                  </View>
                </View>

                <Text style={[styles.cardDescription, typography.body]}>
                  {opt.description}
                </Text>

                {isSelected && (
                  <View style={styles.selectedMarker}>
                    <CheckCircle2 color={colors.primary} size={18} />
                    <Text style={[styles.selectedText, typography.captionBold]}>Selected</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Scheduled Slot Picker (conditional) */}
        {selectedService === 'scheduled' && (
          <View style={[styles.scheduleCard, shadows.sm]}>
            <Text style={[styles.scheduleHeading, typography.bodyBold]}>
              Select Delivery Time Slot
            </Text>
            <View style={styles.slotsGrid}>
              {timeSlots.map((slot) => (
                <Pressable
                  key={slot}
                  style={[
                    styles.slotPill,
                    selectedSlot === slot && styles.slotPillActive,
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text
                    style={[
                      styles.slotPillText,
                      typography.captionBold,
                      selectedSlot === slot && { color: colors.primary },
                    ]}
                  >
                    {slot}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.trustBadgeRow}>
          <ShieldCheck color={colors.success} size={16} />
          <Text style={[styles.trustBadgeText, typography.caption]}>
            Real-time GPS tracking & delivery insurance included
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, shadows.lg]}>
        <Button
          title="Next: Review & Price Breakdown"
          onPress={handleContinue}
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
  stepBadge: {
    backgroundColor: colors.primarySoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
  },
  stepBadgeText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  optionsList: {
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconWrap: {
    marginRight: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: colors.textPrimary,
  },
  fastBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.full,
  },
  fastBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardEta: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceWrap: {
    marginLeft: spacing.sm,
  },
  priceTag: {
    color: colors.primaryDark,
  },
  cardDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  selectedMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
  },
  selectedText: {
    color: colors.primary,
  },
  scheduleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  scheduleHeading: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  slotsGrid: {
    gap: spacing.sm,
  },
  slotPill: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: borderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  slotPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  slotPillText: {
    color: colors.textPrimary,
  },
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: spacing.md,
  },
  trustBadgeText: {
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


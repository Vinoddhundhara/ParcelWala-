import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  MapPin,
  Bookmark,
  User,
  Building,
  AlertCircle,
  Phone,
  CheckCircle2,
} from 'lucide-react-native';
import { Input } from '../../src/components/forms/Input';
import { PhoneInput } from '../../src/components/forms/PhoneInput';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useBookingStore } from '../../src/store/useBookingStore';
import { useAddressStore } from '../../src/store/useAddressStore';
import { addressSchema, getFirstZodError } from '../../src/utils/validation';
import { Address } from '../../src/types';
import { PRESET_HUBS } from '../../src/services/location/locationService';

export default function DropAddressScreen() {
  const router = useRouter();
  const savedAddresses = useAddressStore((s) => s.addresses);
  const pickupAddress = useBookingStore((s) => s.pickupAddress);
  const currentDrop = useBookingStore((s) => s.dropAddress);
  const setDropAddress = useBookingStore((s) => s.setDropAddress);

  const [contactName, setContactName] = useState(
    currentDrop?.contactName || 'Ethan Brooks'
  );
  const [contactPhone, setContactPhone] = useState(
    currentDrop?.contactPhone || '9876599887'
  );
  const [streetAddress, setStreetAddress] = useState(
    currentDrop?.streetAddress || 'House 14, 80 Feet Road, 4th Block Koramangala'
  );
  const [landmark, setLandmark] = useState(currentDrop?.landmark || 'Opposite Sony World Signal');
  const [city, setCity] = useState(currentDrop?.city || 'Bengaluru');
  const [postalCode, setPostalCode] = useState(currentDrop?.postalCode || '560034');
  const [instructions, setInstructions] = useState(currentDrop?.instructions || '');
  const [latitude, setLatitude] = useState(
    currentDrop?.latitude || PRESET_HUBS.bengaluru_koramangala.lat
  );
  const [longitude, setLongitude] = useState(
    currentDrop?.longitude || PRESET_HUBS.bengaluru_koramangala.lon
  );

  const [error, setError] = useState<string | null>(null);

  const quickDropLandmarks = ['Near Metro Station', 'Opposite Mall', 'Apartment Gate', 'Commercial Complex'];
  const quickDropInstructions = ['Call recipient at gate', 'Handover only with OTP', 'Leave with security guard'];

  const handleSelectSaved = (addr: Address) => {
    setContactName(addr.contactName);
    setContactPhone(addr.contactPhone);
    setStreetAddress(addr.streetAddress);
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setPostalCode(addr.postalCode);
    setLatitude(addr.latitude);
    setLongitude(addr.longitude);
    if (addr.instructions) setInstructions(addr.instructions);
    setError(null);
  };

  const handleContinue = () => {
    const addressData = {
      label: 'Other' as const,
      contactName,
      contactPhone,
      streetAddress,
      landmark,
      city,
      state: 'Karnataka',
      postalCode,
      instructions,
    };

    const parse = addressSchema.safeParse(addressData);
    if (!parse.success) {
      setError(getFirstZodError(parse.error));
      return;
    }

    if (
      pickupAddress &&
      pickupAddress.streetAddress.trim().toLowerCase() ===
        streetAddress.trim().toLowerCase()
    ) {
      setError('Drop address cannot be identical to pickup address.');
      return;
    }

    setError(null);

    const fullAddress: Address = {
      id: currentDrop?.id || `drop_${Date.now()}`,
      ...addressData,
      latitude,
      longitude,
    };

    setDropAddress(fullAddress);
    router.push('/booking/parcel');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.textPrimary} size={22} />
          </Pressable>

          <View style={styles.stepBadge}>
            <Text style={[styles.stepBadgeText, typography.micro]}>STEP 2 OF 5</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.titleSection}>
          <Text style={[styles.title, typography.h1]}>Where to deliver?</Text>
          <Text style={[styles.subtitle, typography.body]}>
            Enter recipient's address and phone number for delivery handoff.
          </Text>
        </Animated.View>

        {/* Pickup summary pill */}
        {pickupAddress && (
          <Animated.View entering={FadeInDown.delay(150).duration(450)} style={styles.pickupPill}>
            <View style={styles.pickupPillDot} />
            <Text style={[styles.pickupPillText, typography.caption]} numberOfLines={1}>
              From: <Text style={{ fontWeight: '700' }}>{pickupAddress.streetAddress}</Text>
            </Text>
          </Animated.View>
        )}

        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.savedSection}>
            <Text style={[styles.sectionHeading, typography.captionBold]}>SAVED ADDRESSES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedScroll}>
              {savedAddresses.map((addr) => (
                <Pressable
                  key={addr.id}
                  style={[
                    styles.savedChip,
                    streetAddress === addr.streetAddress && styles.savedChipActive,
                  ]}
                  onPress={() => handleSelectSaved(addr)}
                >
                  <Bookmark
                    color={streetAddress === addr.streetAddress ? colors.primary : colors.textMuted}
                    size={14}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.savedChipLabel,
                      typography.captionBold,
                      streetAddress === addr.streetAddress && { color: colors.primary },
                    ]}
                  >
                    {addr.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorAlert}>
            <AlertCircle color={colors.danger} size={18} style={{ marginRight: 8 }} />
            <Text style={[styles.errorAlertText, typography.bodyMedium]}>{error}</Text>
          </View>
        )}

        {/* Form Fields */}
        <Animated.View entering={FadeInDown.delay(250).duration(450)} style={styles.formSection}>
          <Input
            label="Recipient House / Building / Street *"
            value={streetAddress}
            onChangeText={(val) => {
              setStreetAddress(val);
              if (error) setError(null);
            }}
            placeholder="e.g. House 14, 80 Feet Road, 4th Block"
            leftIcon={<Building color={colors.textSecondary} size={18} />}
          />

          {/* Quick Drop Landmark Chips */}
          <View style={styles.quickLandmarksRow}>
            {quickDropLandmarks.map((lm, idx) => (
              <Pressable
                key={idx}
                style={styles.quickLmChip}
                onPress={() => setLandmark(lm)}
              >
                <Text style={[styles.quickLmText, typography.micro]}>{lm}</Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Nearby Landmark"
            value={landmark}
            onChangeText={setLandmark}
            placeholder="e.g. Opposite Sony World Signal"
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Input
                label="City *"
                value={city}
                onChangeText={(val) => {
                  setCity(val);
                  if (error) setError(null);
                }}
                placeholder="Bengaluru"
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Input
                label="PIN Code *"
                value={postalCode}
                onChangeText={(val) => {
                  setPostalCode(val);
                  if (error) setError(null);
                }}
                placeholder="560034"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          <Input
            label="Receiver Name *"
            value={contactName}
            onChangeText={(val) => {
              setContactName(val);
              if (error) setError(null);
            }}
            placeholder="Recipient name"
            leftIcon={<User color={colors.textSecondary} size={18} />}
          />

          <PhoneInput
            label="Receiver Mobile Number *"
            value={contactPhone}
            onChangePhone={(val: string) => {
              setContactPhone(val);
              if (error) setError(null);
            }}
          />

          {/* Quick Drop Instructions */}
          <View style={styles.quickLandmarksRow}>
            {quickDropInstructions.map((inst, idx) => (
              <Pressable
                key={idx}
                style={styles.quickLmChip}
                onPress={() => setInstructions(inst)}
              >
                <Text style={[styles.quickLmText, typography.micro]}>{inst}</Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Delivery Instructions"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="e.g. Call before coming, drop at gate"
            multiline
            numberOfLines={2}
          />
        </Animated.View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, shadows.lg]}>
        <Button
          title="Next: Parcel Details"
          onPress={handleContinue}
          size="lg"
          variant="primary"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
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
  pickupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  pickupPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  pickupPillText: {
    color: colors.textSecondary,
    flex: 1,
  },
  savedSection: {
    gap: 8,
  },
  sectionHeading: {
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  savedScroll: {
    flexDirection: 'row',
  },
  savedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  savedChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  savedChipLabel: {
    color: colors.textPrimary,
  },
  formSection: {
    gap: spacing.base,
  },
  quickLandmarksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: -4,
  },
  quickLmChip: {
    backgroundColor: colors.surface,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  quickLmText: {
    color: colors.textSecondary,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  errorAlertText: {
    color: colors.dangerDark,
    flex: 1,
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
});

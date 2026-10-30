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
  Compass,
  Bookmark,
  User,
  Phone,
  Building,
  AlertCircle,
  CheckCircle2,
  Navigation,
} from 'lucide-react-native';
import { Input } from '../../src/components/forms/Input';
import { PhoneInput } from '../../src/components/forms/PhoneInput';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useBookingStore } from '../../src/store/useBookingStore';
import { useAddressStore } from '../../src/store/useAddressStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { locationService } from '../../src/services/location/locationService';
import { addressSchema, getFirstZodError } from '../../src/utils/validation';
import { Address } from '../../src/types';

export default function PickupAddressScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const savedAddresses = useAddressStore((s) => s.addresses);
  const currentPickup = useBookingStore((s) => s.pickupAddress);
  const setPickupAddress = useBookingStore((s) => s.setPickupAddress);

  const [isSelf, setIsSelf] = useState<boolean>(true);
  const [contactName, setContactName] = useState(
    currentPickup?.contactName || user?.name || 'Olivia Smith'
  );
  const [contactPhone, setContactPhone] = useState(
    currentPickup?.contactPhone || user?.phone || '9876543210'
  );
  const [streetAddress, setStreetAddress] = useState(
    currentPickup?.streetAddress || ''
  );
  const [landmark, setLandmark] = useState(currentPickup?.landmark || '');
  const [city, setCity] = useState(currentPickup?.city || 'Bengaluru');
  const [postalCode, setPostalCode] = useState(currentPickup?.postalCode || '560038');
  const [instructions, setInstructions] = useState(currentPickup?.instructions || '');
  const [latitude, setLatitude] = useState(currentPickup?.latitude || 12.9784);
  const [longitude, setLongitude] = useState(currentPickup?.longitude || 77.6408);

  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickLandmarks = ['Near Metro Station', 'Opposite Shopping Mall', 'Apartment Gate 1', 'Main Market'];
  const quickInstructions = ['Call upon arrival', 'Leave with building security', 'Do not ring bell'];

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setError(null);
    try {
      const res = await locationService.requestCurrentLocation();
      setLatitude(res.latitude);
      setLongitude(res.longitude);
      if (res.streetAddress) setStreetAddress(res.streetAddress);
      if (res.city) setCity(res.city);
      if (res.postalCode) setPostalCode(res.postalCode);
      if (res.error) setError(res.error);
    } finally {
      setIsLocating(false);
    }
  };

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

  const handleToggleSender = (self: boolean) => {
    setIsSelf(self);
    if (self) {
      setContactName(user?.name || 'Olivia Smith');
      setContactPhone(user?.phone || '9876543210');
    } else {
      setContactName('');
      setContactPhone('');
    }
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
    setError(null);

    const fullAddress: Address = {
      id: currentPickup?.id || `pickup_${Date.now()}`,
      ...addressData,
      latitude,
      longitude,
    };

    setPickupAddress(fullAddress);
    router.push('/booking/drop');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Step Indicator Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.textPrimary} size={22} />
          </Pressable>

          <View style={styles.stepBadge}>
            <Text style={[styles.stepBadgeText, typography.micro]}>STEP 1 OF 5</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.titleSection}>
          <Text style={[styles.title, typography.h1]}>Where to pick up?</Text>
          <Text style={[styles.subtitle, typography.body]}>
            Enter pickup address and sender contact details for parcel collection.
          </Text>
        </Animated.View>

        {/* Sender Toggle ("I am sending" vs "Someone else") */}
        <Animated.View entering={FadeInDown.delay(150).duration(450)} style={styles.senderToggleRow}>
          <Pressable
            style={[styles.senderToggleBtn, isSelf && styles.senderToggleBtnActive]}
            onPress={() => handleToggleSender(true)}
          >
            <User color={isSelf ? '#FFFFFF' : colors.textSecondary} size={15} />
            <Text style={[styles.senderToggleText, isSelf && { color: '#FFFFFF', fontWeight: '800' }]}>
              I Am The Sender
            </Text>
          </Pressable>

          <Pressable
            style={[styles.senderToggleBtn, !isSelf && styles.senderToggleBtnActive]}
            onPress={() => handleToggleSender(false)}
          >
            <User color={!isSelf ? '#FFFFFF' : colors.textSecondary} size={15} />
            <Text style={[styles.senderToggleText, !isSelf && { color: '#FFFFFF', fontWeight: '800' }]}>
              Someone Else
            </Text>
          </Pressable>
        </Animated.View>

        {/* Quick GPS Location Action Button */}
        <Animated.View entering={FadeInDown.delay(200).duration(450)}>
          <Pressable
            style={styles.currentLocationBtn}
            onPress={handleUseCurrentLocation}
            disabled={isLocating}
          >
            <Compass color={colors.primary} size={18} />
            <Text style={[styles.currentLocationText, typography.bodyBold]}>
              {isLocating ? 'Locating device via GPS...' : 'Use Current Device Location'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Saved Addresses Carousel */}
        {savedAddresses.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250).duration(450)} style={styles.savedSection}>
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

        {/* Address & Contact Fields */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)} style={styles.formSection}>
          <Input
            label="House / Flat / Street Address *"
            value={streetAddress}
            onChangeText={(val) => {
              setStreetAddress(val);
              if (error) setError(null);
            }}
            placeholder="e.g. Flat 402, Sunshine Heights, 100ft Road"
            leftIcon={<Building color={colors.textSecondary} size={18} />}
          />

          {/* Quick Landmark Chips */}
          <View style={styles.quickLandmarksRow}>
            {quickLandmarks.map((lm, idx) => (
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
            placeholder="e.g. Near Metro Pillar 42"
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
                label="Pincode *"
                value={postalCode}
                onChangeText={(val) => {
                  setPostalCode(val);
                  if (error) setError(null);
                }}
                placeholder="560038"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="Sender Full Name *"
            value={contactName}
            onChangeText={(val) => {
              setContactName(val);
              if (error) setError(null);
            }}
            placeholder="e.g. Olivia Smith"
            leftIcon={<User color={colors.textSecondary} size={18} />}
          />

          <PhoneInput
            label="Sender Mobile Number *"
            value={contactPhone}
            onChangePhone={(val: string) => {
              setContactPhone(val);
              if (error) setError(null);
            }}
          />

          {/* Quick Instructions */}
          <View style={styles.quickLandmarksRow}>
            {quickInstructions.map((inst, idx) => (
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
            label="Pickup Instructions for Courier"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="e.g. Call before arrival, 3rd floor"
            multiline
            numberOfLines={2}
          />
        </Animated.View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, shadows.lg]}>
        <Button
          title="Continue to Drop Address"
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
  senderToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.xl,
    padding: 4,
    gap: 4,
  },
  senderToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
    gap: 6,
  },
  senderToggleBtnActive: {
    backgroundColor: colors.primary,
  },
  senderToggleText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    paddingVertical: 12,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    gap: 8,
  },
  currentLocationText: {
    color: colors.primary,
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

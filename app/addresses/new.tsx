import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Home,
  Briefcase,
  MapPin,
  AlertCircle,
  Building,
} from 'lucide-react-native';
import { Input } from '../../src/components/forms/Input';
import { PhoneInput } from '../../src/components/forms/PhoneInput';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography } from '../../src/theme';
import { useAddressStore } from '../../src/store/useAddressStore';
import { addressSchema, getFirstZodError } from '../../src/utils/validation';
import { AddressLabel } from '../../src/types';
import { PRESET_HUBS } from '../../src/services/location/locationService';

export default function NewAddressScreen() {
  const router = useRouter();
  const addAddress = useAddressStore((s) => s.addAddress);

  const [label, setLabel] = useState<AddressLabel>('Home');
  const [customLabel, setCustomLabel] = useState('');
  const [contactName, setContactName] = useState('Olivia Smith');
  const [contactPhone, setContactPhone] = useState('9876543210');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560038');
  const [instructions, setInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const labelOptions: { id: AddressLabel; label: string; icon: React.ReactNode }[] = [
    { id: 'Home', label: 'Home', icon: <Home color={colors.primary} size={18} /> },
    { id: 'Work', label: 'Work', icon: <Briefcase color="#3B82F6" size={18} /> },
    { id: 'Other', label: 'Other', icon: <MapPin color="#8B5CF6" size={18} /> },
  ];

  const handleSave = async () => {
    const data = {
      label,
      customLabel: label === 'Other' && customLabel ? customLabel : undefined,
      contactName,
      contactPhone,
      streetAddress,
      landmark,
      city,
      state,
      postalCode,
      instructions,
    };

    const parse = addressSchema.safeParse(data);
    if (!parse.success) {
      setError(getFirstZodError(parse.error));
      return;
    }
    setError(null);
    setIsSaving(true);

    try {
      await addAddress({
        ...data,
        latitude: PRESET_HUBS.bengaluru_indiranagar.lat,
        longitude: PRESET_HUBS.bengaluru_indiranagar.lon,
        isDefault,
      });
      setIsSaving(false);
      router.back();
    } catch (err: unknown) {
      setIsSaving(false);
      setError((err as Error)?.message || 'Failed to save address');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.textPrimary} size={22} />
          </Pressable>
          <Text style={[styles.headerTitle, typography.h3]}>Add New Address</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Label Selector */}
        <View style={styles.labelSection}>
          <Text style={[styles.sectionTitle, typography.bodyBold]}>Save Address As</Text>
          <View style={styles.labelOptionsRow}>
            {labelOptions.map((opt) => {
              const isSelected = label === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.labelChip,
                    isSelected && styles.labelChipSelected,
                  ]}
                  onPress={() => setLabel(opt.id)}
                >
                  {opt.icon}
                  <Text
                    style={[
                      styles.labelChipText,
                      typography.bodyBold,
                      isSelected && { color: colors.primary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {label === 'Other' && (
            <Input
              label="Custom Label Name (e.g. Gym, Mom's House)"
              value={customLabel}
              onChangeText={setCustomLabel}
              placeholder="e.g. Grandma's Place"
              containerStyle={{ marginTop: spacing.sm }}
            />
          )}
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorAlert}>
            <AlertCircle color={colors.danger} size={18} style={{ marginRight: 8 }} />
            <Text style={[styles.errorAlertText, typography.bodyMedium]}>{error}</Text>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Input
            label="Street Address / Flat / Building *"
            value={streetAddress}
            onChangeText={(val) => {
              setStreetAddress(val);
              if (error) setError(null);
            }}
            placeholder="e.g. Flat 301, Lakeview Residency, 12th Cross"
            leftIcon={<Building color={colors.textSecondary} size={18} />}
          />

          <Input
            label="Landmark (Optional)"
            value={landmark}
            onChangeText={setLandmark}
            placeholder="e.g. Near HDFC Bank ATM"
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Input
                label="City *"
                value={city}
                onChangeText={setCity}
                placeholder="Bengaluru"
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Input
                label="PIN Code *"
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="560038"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          <Input
            label="Contact Person Name *"
            value={contactName}
            onChangeText={setContactName}
            placeholder="Full Name"
          />

          <PhoneInput
            label="Contact Mobile Number *"
            value={contactPhone}
            onChangePhone={setContactPhone}
          />

          <Input
            label="Delivery Instructions"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="e.g. Leave with security guard if door is locked"
          />

          {/* Default Address Switch */}
          <View style={styles.defaultSwitchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.defaultSwitchTitle, typography.bodyBold]}>
                Set as Default Address
              </Text>
              <Text style={[styles.defaultSwitchSub, typography.caption]}>
                Auto-selected as default pickup location
              </Text>
            </View>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.footer}>
          <Button
            title="Save Address"
            onPress={handleSave}
            loading={isSaving}
            size="lg"
            variant="primary"
          />
        </View>
      </ScrollView>
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
  labelSection: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  labelOptionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  labelChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    gap: 6,
  },
  labelChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  labelChipText: {
    color: colors.textSecondary,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
  },
  errorAlertText: {
    color: colors.dangerDark,
    flex: 1,
  },
  formSection: {
    width: '100%',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  defaultSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginVertical: spacing.sm,
  },
  defaultSwitchTitle: {
    color: colors.textPrimary,
  },
  defaultSwitchSub: {
    color: colors.textMuted,
    marginTop: 2,
  },
  footer: {
    marginTop: spacing.xl,
  },
});

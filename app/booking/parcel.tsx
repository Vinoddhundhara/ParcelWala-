import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Camera,
  Check,
  AlertCircle,
  FileText,
  Package,
  Boxes,
  Wine,
  ShieldCheck,
  Layers,
  Bike,
  Truck,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react-native';
import { PackageIllustration } from '../../src/components/illustrations/PackageIllustration';
import { Input } from '../../src/components/forms/Input';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useBookingStore } from '../../src/store/useBookingStore';
import { parcelDetailsSchema, PARCEL_LIMITS, getFirstZodError } from '../../src/utils/validation';
import { ParcelCategory, ParcelDetails, VehicleType } from '../../src/types';

export default function ParcelDetailsScreen() {
  const router = useRouter();
  const parcel = useBookingStore((s) => s.parcel);
  const vehicleType = useBookingStore((s) => s.vehicleType);
  const insuranceOptIn = useBookingStore((s) => s.insuranceOptIn);
  const setParcelDetails = useBookingStore((s) => s.setParcelDetails);
  const setCategory = useBookingStore((s) => s.setCategory);
  const setVehicleType = useBookingStore((s) => s.setVehicleType);
  const setInsuranceOptIn = useBookingStore((s) => s.setInsuranceOptIn);

  const [category, setSelectedCategory] = useState<ParcelCategory>(parcel.category || 'small');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(vehicleType || 'bike');
  const [description, setDescription] = useState(parcel.description || 'Laptop and accessories');
  const [weightKg, setWeightKg] = useState(String(parcel.weightKg || '1.5'));
  const [lengthCm, setLengthCm] = useState(String(parcel.lengthCm || '25'));
  const [widthCm, setWidthCm] = useState(String(parcel.widthCm || '20'));
  const [heightCm, setHeightCm] = useState(String(parcel.heightCm || '15'));
  const [declaredValueInr, setDeclaredValueInr] = useState(String(parcel.declaredValueInr || '1000'));
  const [fragileHandling, setFragileHandling] = useState(parcel.fragileHandling || false);
  const [specialInstructions, setSpecialInstructions] = useState(parcel.specialInstructions || '');
  const [photoUri, setPhotoUri] = useState<string | undefined>(parcel.photoUri);
  const [insuranceActive, setInsuranceActive] = useState<boolean>(insuranceOptIn);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions: {
    id: ParcelCategory;
    name: string;
    weightMax: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'documents',
      name: 'Documents',
      weightMax: 'Up to 2 kg',
      icon: <FileText color="#FF5E00" size={20} />,
    },
    {
      id: 'small',
      name: 'Small Box',
      weightMax: 'Up to 5 kg',
      icon: <Package color="#3B82F6" size={20} />,
    },
    {
      id: 'medium',
      name: 'Medium Box',
      weightMax: 'Up to 15 kg',
      icon: <Layers color="#10B981" size={20} />,
    },
    {
      id: 'large',
      name: 'Large Cargo',
      weightMax: 'Up to 30 kg',
      icon: <Boxes color="#8B5CF6" size={20} />,
    },
    {
      id: 'fragile',
      name: 'Fragile Item',
      weightMax: 'Up to 10 kg',
      icon: <Wine color="#EF4444" size={20} />,
    },
  ];

  const vehicleOptions = [
    {
      id: 'bike' as VehicleType,
      title: '2-Wheeler',
      capacity: 'Up to 15 kg',
      eta: 'Fastest',
      icon: <Bike color={selectedVehicle === 'bike' ? '#FFFFFF' : colors.primary} size={18} />,
    },
    {
      id: 'auto_cargo' as VehicleType,
      title: '3-Wheeler Auto',
      capacity: 'Up to 100 kg',
      eta: 'Standard',
      icon: <Boxes color={selectedVehicle === 'auto_cargo' ? '#FFFFFF' : '#8B5CF6'} size={18} />,
    },
    {
      id: 'mini_truck' as VehicleType,
      title: 'Tata Ace',
      capacity: 'Up to 500 kg',
      eta: 'Heavy cargo',
      icon: <Truck color={selectedVehicle === 'mini_truck' ? '#FFFFFF' : '#059669'} size={18} />,
    },
  ];

  const quickWeights = [0.5, 1, 2, 5, 10, 15];

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      // Permission denied or cancelled
    }
  };

  const handleCategoryChange = (cat: ParcelCategory) => {
    setSelectedCategory(cat);
    setCategory(cat);
    if (cat === 'fragile') {
      setFragileHandling(true);
    }
    const limits = PARCEL_LIMITS[cat];
    if (Number(weightKg) > limits.maxWeightKg) {
      setWeightKg(String(limits.maxWeightKg));
    }
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weightKg) || 1;
    const next = Math.max(0.5, Math.min(50, Math.round((current + delta) * 10) / 10));
    setWeightKg(String(next));
  };

  const handleContinue = () => {
    const parsedWeight = parseFloat(weightKg);
    const parsedLength = parseFloat(lengthCm);
    const parsedWidth = parseFloat(widthCm);
    const parsedHeight = parseFloat(heightCm);
    const parsedValue = declaredValueInr ? parseFloat(declaredValueInr) : undefined;

    const data: ParcelDetails = {
      category,
      description,
      weightKg: isNaN(parsedWeight) ? 0 : parsedWeight,
      lengthCm: isNaN(parsedLength) ? 0 : parsedLength,
      widthCm: isNaN(parsedWidth) ? 0 : parsedWidth,
      heightCm: isNaN(parsedHeight) ? 0 : parsedHeight,
      declaredValueInr: parsedValue,
      fragileHandling,
      specialInstructions,
      photoUri,
    };

    const parse = parcelDetailsSchema.safeParse(data);
    if (!parse.success) {
      setError(getFirstZodError(parse.error));
      return;
    }
    setError(null);

    setParcelDetails(data);
    setVehicleType(selectedVehicle);
    setInsuranceOptIn(insuranceActive);
    router.push('/booking/delivery-options');
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
            <Text style={[styles.stepBadgeText, typography.micro]}>STEP 3 OF 5</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.titleSection}>
          <Text style={[styles.title, typography.h1]}>Parcel Specifications</Text>
          <Text style={[styles.subtitle, typography.body]}>
            Choose packaging size, vehicle tier, and protection for your shipment.
          </Text>
        </Animated.View>

        {/* Dynamic Package Illustration Display */}
        <Animated.View entering={FadeInDown.delay(150).duration(450)} style={[styles.illustrationCard, shadows.sm]}>
          <PackageIllustration category={category} size={110} />
          <View style={styles.illustrationMeta}>
            <Text style={[styles.illustrationCategory, typography.h3]}>
              {category.charAt(0).toUpperCase() + category.slice(1)} Package
            </Text>
            <Text style={[styles.illustrationLimit, typography.caption]}>
              Max allowable: {PARCEL_LIMITS[category].maxWeightKg} kg
            </Text>
          </View>
        </Animated.View>

        {/* Vehicle Selection Row */}
        <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, typography.captionBold]}>ASSIGN VEHICLE TIER</Text>
          <View style={styles.vehicleRow}>
            {vehicleOptions.map((v) => {
              const isSelected = selectedVehicle === v.id;
              return (
                <Pressable
                  key={v.id}
                  style={[
                    styles.vehiclePill,
                    isSelected ? styles.vehiclePillActive : styles.vehiclePillInactive,
                  ]}
                  onPress={() => setSelectedVehicle(v.id)}
                >
                  <View
                    style={[
                      styles.vehicleIconCircle,
                      { backgroundColor: isSelected ? colors.primary : '#E2E8F0' },
                    ]}
                  >
                    {v.icon}
                  </View>
                  <Text
                    style={[
                      styles.vehiclePillTitle,
                      typography.captionBold,
                      isSelected && { color: colors.primary },
                    ]}
                  >
                    {v.title}
                  </Text>
                  <Text style={[styles.vehiclePillCapacity, typography.micro]}>
                    {v.capacity}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Category Horizontal Selector */}
        <Animated.View entering={FadeInDown.delay(250).duration(450)} style={styles.categorySection}>
          <Text style={[styles.sectionHeading, typography.captionBold]}>SELECT PACKAGE TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categoryOptions.map((opt) => {
              const isSelected = category === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  style={[styles.categoryOption, isSelected && styles.categoryOptionSelected]}
                  onPress={() => handleCategoryChange(opt.id)}
                >
                  <View style={styles.categoryIconWrap}>{opt.icon}</View>
                  <Text
                    style={[
                      styles.categoryOptName,
                      typography.bodyBold,
                      isSelected && { color: colors.primary },
                    ]}
                  >
                    {opt.name}
                  </Text>
                  <Text style={[styles.categoryOptWeight, typography.micro]}>
                    {opt.weightMax}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Error message */}
        {error && (
          <View style={styles.errorAlert}>
            <AlertCircle color={colors.danger} size={18} style={{ marginRight: 8 }} />
            <Text style={[styles.errorAlertText, typography.bodyMedium]}>{error}</Text>
          </View>
        )}

        {/* Interactive Weight Stepper */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)} style={[styles.card, shadows.sm]}>
          <Text style={[styles.sectionHeading, typography.captionBold]}>PARCEL WEIGHT</Text>
          <View style={styles.stepperRow}>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => adjustWeight(-0.5)}
              accessibilityLabel="Decrease weight"
            >
              <Minus color={colors.textPrimary} size={18} />
            </Pressable>

            <View style={styles.weightDisplay}>
              <Text style={[styles.weightBigText, typography.hero]}>{weightKg}</Text>
              <Text style={[styles.weightUnit, typography.captionBold]}>KG</Text>
            </View>

            <Pressable
              style={styles.stepperBtn}
              onPress={() => adjustWeight(0.5)}
              accessibilityLabel="Increase weight"
            >
              <Plus color={colors.textPrimary} size={18} />
            </Pressable>
          </View>

          {/* Quick Weight Chips */}
          <View style={styles.quickChipsRow}>
            {quickWeights.map((w) => (
              <Pressable
                key={w}
                style={[
                  styles.quickChip,
                  parseFloat(weightKg) === w && styles.quickChipActive,
                ]}
                onPress={() => setWeightKg(String(w))}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    typography.micro,
                    parseFloat(weightKg) === w && { color: '#FFFFFF', fontWeight: '800' },
                  ]}
                >
                  {w} kg
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Form Details */}
        <Animated.View entering={FadeInDown.delay(350).duration(450)} style={styles.formSection}>
          <Input
            label="Parcel Contents / Description *"
            value={description}
            onChangeText={(val) => {
              setDescription(val);
              if (error) setError(null);
            }}
            placeholder="e.g. Laptop, Clothes, Documents"
          />

          <Input
            label="Declared Value (₹) — for insurance coverage"
            value={declaredValueInr}
            onChangeText={setDeclaredValueInr}
            placeholder="1000"
            keyboardType="numeric"
          />

          <Text style={[styles.dimensionsLabel, typography.bodyBold]}>Dimensions (cm)</Text>
          <View style={styles.dimensionsRow}>
            <View style={{ flex: 1, marginRight: spacing.xs }}>
              <Input
                placeholder="L"
                value={lengthCm}
                onChangeText={setLengthCm}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginHorizontal: spacing.xs }}>
              <Input
                placeholder="W"
                value={widthCm}
                onChangeText={setWidthCm}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.xs }}>
              <Input
                placeholder="H"
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Fragile Switch */}
          <Pressable
            style={[styles.toggleCard, fragileHandling && styles.toggleCardActive]}
            onPress={() => setFragileHandling(!fragileHandling)}
          >
            <Wine color={fragileHandling ? colors.danger : colors.textMuted} size={22} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[styles.toggleTitle, typography.bodyBold]}>Handle with Special Care</Text>
              <Text style={[styles.toggleSubtitle, typography.caption]}>
                Adds fragile tags and prioritized gentle handling
              </Text>
            </View>
            <View style={[styles.checkbox, fragileHandling && styles.checkboxActive]}>
              {fragileHandling && <Check color="#FFFFFF" size={14} />}
            </View>
          </Pressable>

          {/* Transit Protection Insurance Toggle */}
          <Pressable
            style={[styles.toggleCard, insuranceActive && styles.insuranceCardActive]}
            onPress={() => setInsuranceActive(!insuranceActive)}
          >
            <ShieldCheck color={insuranceActive ? colors.success : colors.textMuted} size={22} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.toggleTitle, typography.bodyBold]}>Transit Protection Cover</Text>
                <View style={styles.insuranceBadge}>
                  <Text style={[styles.insuranceBadgeText, typography.micro]}>₹15 ONLY</Text>
                </View>
              </View>
              <Text style={[styles.toggleSubtitle, typography.caption]}>
                100% loss/damage compensation up to ₹10,000
              </Text>
            </View>
            <View style={[styles.checkbox, insuranceActive && styles.checkboxActiveSuccess]}>
              {insuranceActive && <Check color="#FFFFFF" size={14} />}
            </View>
          </Pressable>

          {/* Optional Photo Picker */}
          <View style={styles.photoSection}>
            <Text style={[styles.sectionHeading, typography.captionBold]}>
              PARCEL PHOTO (OPTIONAL)
            </Text>
            {photoUri ? (
              <View style={styles.photoPreviewWrap}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <Pressable style={styles.changePhotoBtn} onPress={handlePickPhoto}>
                  <Camera color="#FFFFFF" size={16} style={{ marginRight: 6 }} />
                  <Text style={[styles.changePhotoText, typography.captionBold]}>Change Photo</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.addPhotoBtn} onPress={handlePickPhoto}>
                <Camera color={colors.primary} size={24} />
                <Text style={[styles.addPhotoText, typography.bodyBold]}>Upload Parcel Photo</Text>
                <Text style={[styles.addPhotoSub, typography.micro]}>
                  Helps rider identify your package easily
                </Text>
              </Pressable>
            )}
          </View>

          <Input
            label="Special Instructions for Courier"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            placeholder="e.g. Ring the bell twice, fragile electronics inside"
            multiline
            numberOfLines={2}
          />
        </Animated.View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, shadows.lg]}>
        <Button
          title="Continue to Delivery Speed"
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
  illustrationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  illustrationMeta: {
    flex: 1,
    marginLeft: spacing.base,
  },
  illustrationCategory: {
    color: colors.textPrimary,
  },
  illustrationLimit: {
    color: colors.textMuted,
    marginTop: 4,
  },
  sectionWrap: {
    gap: 8,
  },
  sectionHeading: {
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  vehiclePill: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  vehiclePillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: colors.primary,
  },
  vehiclePillInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  vehicleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  vehiclePillTitle: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  vehiclePillCapacity: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  categorySection: {
    gap: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryOption: {
    width: 110,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  categoryOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryOptName: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 12,
  },
  categoryOptWeight: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginVertical: spacing.sm,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  weightBigText: {
    color: colors.primary,
    letterSpacing: -1,
  },
  weightUnit: {
    color: colors.textSecondary,
  },
  quickChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  quickChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickChipText: {
    color: colors.textSecondary,
  },
  formSection: {
    gap: spacing.base,
  },
  dimensionsLabel: {
    color: colors.textPrimary,
    marginBottom: -4,
  },
  dimensionsRow: {
    flexDirection: 'row',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  toggleCardActive: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  insuranceCardActive: {
    borderColor: colors.success,
    backgroundColor: '#ECFDF5',
  },
  toggleTitle: {
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  insuranceBadge: {
    backgroundColor: colors.success,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.full,
  },
  insuranceBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  checkboxActiveSuccess: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  photoSection: {
    gap: 8,
  },
  addPhotoBtn: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
    gap: 4,
  },
  addPhotoText: {
    color: colors.primary,
  },
  addPhotoSub: {
    color: colors.textMuted,
  },
  photoPreviewWrap: {
    position: 'relative',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 180,
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
  },
  changePhotoText: {
    color: '#FFFFFF',
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

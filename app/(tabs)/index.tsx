import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  MapPin,
  Bell,
  ArrowRight,
  FileText,
  Package,
  Boxes,
  Wine,
  Sparkles,
  Clock,
  ChevronRight,
  ShieldCheck,
  Percent,
  Bike,
  Truck,
  RotateCcw,
  Zap,
  Laptop,
  Shirt,
  UtensilsCrossed,
  Pill,
  Gift,
} from 'lucide-react-native';
import { PackageIllustration } from '../../src/components/illustrations/PackageIllustration';
import { BikeCourierIllustration } from '../../src/components/illustrations/BikeCourierIllustration';
import { StatusStepper } from '../../src/components/cards/StatusStepper';
import { Badge } from '../../src/components/common/Badge';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useAddressStore } from '../../src/store/useAddressStore';
import { useOrdersStore } from '../../src/store/useOrdersStore';
import { useBookingStore } from '../../src/store/useBookingStore';
import { localStorageService } from '../../src/services/storage/asyncStorage';
import { ParcelCategory, VehicleType } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateAddresses = useAddressStore((s) => s.hydrate);
  const hydrateOrders = useOrdersStore((s) => s.hydrate);

  const defaultAddress = useAddressStore((s) => s.getDefaultAddress());
  const orders = useOrdersStore((s) => s.orders);
  const activeOrderId = useOrdersStore((s) => s.activeOrderId);
  const activeOrder = useOrdersStore((s) =>
    activeOrderId ? s.getOrderById(activeOrderId) : undefined
  );

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('bike');

  React.useEffect(() => {
    const checkOnboardingAndHydrate = async () => {
      const onboardingDone = await localStorageService.getOnboardingCompleted();
      if (!onboardingDone) {
        router.replace('/splash');
        return;
      }
      if (!isLoaded) {
        await Promise.all([hydrateAuth(), hydrateAddresses(), hydrateOrders()]);
      }
    };
    checkOnboardingAndHydrate();
  }, [isLoaded]);

  const resetBooking = useBookingStore((s) => s.resetBooking);
  const setCategory = useBookingStore((s) => s.setCategory);
  const setPickupAddress = useBookingStore((s) => s.setPickupAddress);
  const setVehicleType = useBookingStore((s) => s.setVehicleType);

  const handleStartBooking = (
    preselectedCategory?: ParcelCategory,
    preselectedVehicle?: VehicleType
  ) => {
    resetBooking();
    if (defaultAddress) {
      setPickupAddress(defaultAddress);
    }
    if (preselectedCategory) {
      setCategory(preselectedCategory);
    }
    if (preselectedVehicle) {
      setVehicleType(preselectedVehicle);
    } else {
      setVehicleType(selectedVehicle);
    }
    router.push('/booking/pickup');
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Vehicle fleet categories (Porter style)
  const vehicleOptions = [
    {
      id: 'bike' as VehicleType,
      title: '2-Wheeler Bike',
      subtitle: 'Up to 15 kg • Fastest',
      eta: '5-15 mins',
      base: '₹40',
      badge: 'POPULAR',
      icon: <Bike color={selectedVehicle === 'bike' ? '#FFFFFF' : colors.primary} size={22} />,
    },
    {
      id: 'auto_cargo' as VehicleType,
      title: '3-Wheeler Auto',
      subtitle: 'Up to 100 kg • Covered',
      eta: '10-25 mins',
      base: '₹120',
      badge: 'WEATHER SAFE',
      icon: <Boxes color={selectedVehicle === 'auto_cargo' ? '#FFFFFF' : '#8B5CF6'} size={22} />,
    },
    {
      id: 'mini_truck' as VehicleType,
      title: 'Tata Ace / Truck',
      subtitle: 'Up to 500 kg • Cargo',
      eta: '20-40 mins',
      base: '₹280',
      badge: 'HEAVY LOAD',
      icon: <Truck color={selectedVehicle === 'mini_truck' ? '#FFFFFF' : '#059669'} size={22} />,
    },
  ];

  // Quick Parcel category presets (Blinkit / Zepto instant feel)
  const parcelPresets = [
    {
      id: 'small' as ParcelCategory,
      title: 'Laptop & Tech',
      subtitle: 'Fragile handling',
      icon: <Laptop color="#3B82F6" size={22} />,
      bg: '#EFF6FF',
    },
    {
      id: 'documents' as ParcelCategory,
      title: 'Documents',
      subtitle: 'Legal & cheques',
      icon: <FileText color="#FF5E00" size={22} />,
      bg: '#FFF3EB',
    },
    {
      id: 'small' as ParcelCategory,
      title: 'Clothes & Shoes',
      subtitle: 'Laundry, bags',
      icon: <Shirt color="#10B981" size={22} />,
      bg: '#ECFDF5',
    },
    {
      id: 'small' as ParcelCategory,
      title: 'Tiffin & Food',
      subtitle: 'Warm delivery',
      icon: <UtensilsCrossed color="#F59E0B" size={22} />,
      bg: '#FEF3C7',
    },
    {
      id: 'small' as ParcelCategory,
      title: 'Medicines',
      subtitle: 'Emergency care',
      icon: <Pill color="#EC4899" size={22} />,
      bg: '#FDF2F8',
    },
    {
      id: 'fragile' as ParcelCategory,
      title: 'Gifts & Flowers',
      subtitle: 'Handle with care',
      icon: <Gift color="#8B5CF6" size={22} />,
      bg: '#F5F3FF',
    },
  ];

  // Recent delivered orders for quick 1-tap re-order
  const recentOrders = orders.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar: Location & Profile */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.topBar}>
        <Pressable
          style={styles.locationSelector}
          onPress={() => router.push('/addresses')}
          accessibilityLabel="Change pickup location"
        >
          <View style={styles.locationIconWrap}>
            <MapPin color={colors.primary} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.locationLabel, typography.captionBold]}>
                {defaultAddress?.label || 'Pickup Location'}
              </Text>
              <ChevronRight color={colors.textMuted} size={14} style={{ marginLeft: 2 }} />
            </View>
            <Text style={[styles.locationText, typography.caption]} numberOfLines={1}>
              {defaultAddress?.streetAddress || 'Tap to select address'}
            </Text>
          </View>
        </Pressable>

        <View style={styles.topRightActions}>
          <Pressable
            style={styles.circleIconBtn}
            onPress={() => router.push('/support')}
            accessibilityLabel="Notifications and support"
          >
            <Bell color={colors.textPrimary} size={19} />
          </Pressable>

          <Pressable
            style={styles.avatarBtn}
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityLabel="Open user profile"
          >
            <View style={styles.avatarCircle}>
              <Text style={[styles.avatarText, typography.bodyBold]}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </Text>
            </View>
          </Pressable>
        </View>
      </Animated.View>

      {/* Greeting Banner */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.greetingSection}>
        <View>
          <Text style={[styles.greetingSub, typography.bodyMedium]}>
            {getTimeGreeting()},
          </Text>
          <Text style={[styles.greetingName, typography.h1]}>
            {user?.name || 'Olivia Smith'}
          </Text>
        </View>
        <View style={styles.lightningBadge}>
          <Zap color="#FF5E00" size={14} />
          <Text style={[styles.lightningText, typography.micro]}>Riders within 4 mins</Text>
        </View>
      </Animated.View>

      {/* Active Delivery Card with 4-Digit OTP (Reference Image 1 & 2) */}
      {activeOrder && activeOrder.status !== 'delivered' && activeOrder.status !== 'cancelled' && (
        <Animated.View entering={FadeInDown.delay(150).duration(450)} style={[styles.activeOrderCard, shadows.lg]}>
          <View style={styles.activeOrderTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.liveIndicatorDot} />
              <Text style={[styles.activeOrderTrackingCode, typography.bodyBold]}>
                {activeOrder.trackingCode}
              </Text>
            </View>
            <Badge status={activeOrder.status} label={activeOrder.status.replace('_', ' ')} />
          </View>

          {/* Prominent 4-Digit OTP Banner inside Active Order Card */}
          <View style={styles.orderOtpBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ShieldCheck color="#10B981" size={16} />
              <Text style={[styles.orderOtpTitle, typography.captionBold]}>
                {['created', 'driver_assigned', 'arriving_pickup'].includes(activeOrder.status)
                  ? 'Pickup OTP'
                  : 'Delivery Handover OTP'}
              </Text>
            </View>
            <View style={styles.orderOtpCodeBox}>
              <Text style={[styles.orderOtpDigits, typography.captionBold]}>
                {['created', 'driver_assigned', 'arriving_pickup'].includes(activeOrder.status)
                  ? (activeOrder.pickupOtp || '8738')
                  : (activeOrder.deliveryOtp || '4912')}
              </Text>
            </View>
          </View>

          <View style={styles.activeOrderBody}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.activeOrderLabel, typography.caption]}>Destination</Text>
              <Text style={[styles.activeOrderDestination, typography.bodyBold]} numberOfLines={1}>
                {activeOrder.dropAddress.streetAddress}
              </Text>
              <Text style={[styles.activeOrderEta, typography.caption]}>
                Arrives in ~{activeOrder.fareBreakdown.estimatedMinutes} mins • {activeOrder.vehicleType.toUpperCase()}
              </Text>
            </View>
            <BikeCourierIllustration size={72} showMotionLines={false} />
          </View>

          <StatusStepper currentStatus={activeOrder.status} simplified />

          <Pressable
            style={styles.trackOrderBtn}
            onPress={() => router.push('/(tabs)/track')}
            accessibilityLabel="Track active delivery"
          >
            <Text style={[styles.trackOrderBtnText, typography.bodyBold]}>Live Map Tracking</Text>
            <ArrowRight color="#FFFFFF" size={16} />
          </Pressable>
        </Animated.View>
      )}

      {/* Hero Animated "Send a Parcel" Card with Bike Courier */}
      <Animated.View entering={FadeInDown.delay(200).duration(450)}>
        <Pressable
          style={[styles.heroCard, shadows.orange]}
          onPress={() => handleStartBooking()}
          accessibilityLabel="Send a Parcel Now"
        >
          <View style={styles.heroLeft}>
            <View style={styles.heroBadge}>
              <Sparkles color="#FFFFFF" size={12} style={{ marginRight: 4 }} />
              <Text style={[styles.heroBadgeText, typography.micro]}>INSTANT PICKUP</Text>
            </View>
            <Text style={[styles.heroTitle, typography.h2]}>Send a Parcel</Text>
            <Text style={[styles.heroSubtitle, typography.caption]}>
              Door-to-door courier delivery across the city in minutes.
            </Text>

            <View style={styles.heroCtaRow}>
              <Text style={[styles.heroCtaText, typography.captionBold]}>Book Now</Text>
              <View style={styles.heroArrow}>
                <ArrowRight color={colors.primary} size={15} />
              </View>
            </View>
          </View>

          <View style={styles.heroRight}>
            <BikeCourierIllustration size={120} showMotionLines={true} />
          </View>
        </Pressable>
      </Animated.View>

      {/* Vehicle Fleet Selector (Porter Style) */}
      <Animated.View entering={FadeInDown.delay(250).duration(450)} style={styles.sectionHeaderRow}>
        <View>
          <Text style={[styles.sectionTitle, typography.h3]}>Choose Your Vehicle</Text>
          <Text style={[styles.sectionSubtitle, typography.caption]}>
            Select the right ride for your load
          </Text>
        </View>
      </Animated.View>

      <View style={styles.vehicleRow}>
        {vehicleOptions.map((v) => {
          const isSelected = selectedVehicle === v.id;
          return (
            <Pressable
              key={v.id}
              style={[
                styles.vehicleCard,
                isSelected ? styles.vehicleCardActive : styles.vehicleCardInactive,
                shadows.sm,
              ]}
              onPress={() => {
                setSelectedVehicle(v.id);
                handleStartBooking(undefined, v.id);
              }}
            >
              <View
                style={[
                  styles.vehicleIconCircle,
                  { backgroundColor: isSelected ? colors.primary : '#F1F5F9' },
                ]}
              >
                {v.icon}
              </View>
              <Text
                style={[
                  styles.vehicleTitle,
                  typography.captionBold,
                  isSelected && { color: colors.primary },
                ]}
              >
                {v.title}
              </Text>
              <Text style={[styles.vehicleSubtitle, typography.micro]}>{v.subtitle}</Text>
              <View style={styles.vehicleFareTag}>
                <Text style={[styles.vehicleFareText, typography.captionBold]}>{v.base}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Quick Parcel Item Presets (Blinkit Style) */}
      <Animated.View entering={FadeInDown.delay(300).duration(450)} style={styles.sectionHeaderRow}>
        <View>
          <Text style={[styles.sectionTitle, typography.h3]}>What are you sending?</Text>
          <Text style={[styles.sectionSubtitle, typography.caption]}>
            Instant packaging & weight presets
          </Text>
        </View>
      </Animated.View>

      <View style={styles.presetsGrid}>
        {parcelPresets.map((preset, index) => (
          <Pressable
            key={index}
            style={[styles.presetCard, shadows.sm]}
            onPress={() => handleStartBooking(preset.id)}
            accessibilityLabel={`Send ${preset.title}`}
          >
            <View style={[styles.presetIconWrap, { backgroundColor: preset.bg }]}>
              {preset.icon}
            </View>
            <Text style={[styles.presetTitle, typography.captionBold]} numberOfLines={1}>
              {preset.title}
            </Text>
            <Text style={[styles.presetSubtitle, typography.micro]} numberOfLines={1}>
              {preset.subtitle}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Promotional Offers Banner */}
      <Animated.View entering={FadeInDown.delay(350).duration(450)} style={[styles.promoCard, shadows.sm]}>
        <View style={styles.promoLeft}>
          <View style={styles.promoPill}>
            <Percent color="#B45309" size={13} style={{ marginRight: 4 }} />
            <Text style={[styles.promoPillText, typography.micro]}>OFFER OF THE DAY</Text>
          </View>
          <Text style={[styles.promoTitle, typography.h3]}>Flat ₹50 OFF</Text>
          <Text style={[styles.promoDesc, typography.caption]}>
            Use coupon <Text style={{ fontWeight: '800', color: colors.textPrimary }}>PARCELGO50</Text> on all bike deliveries.
          </Text>
        </View>
        <Pressable
          style={styles.promoApplyBtn}
          onPress={() => handleStartBooking()}
        >
          <Text style={[styles.promoApplyBtnText, typography.captionBold]}>Apply</Text>
        </Pressable>
      </Animated.View>

      {/* Trust & Safety Highlights */}
      <View style={styles.trustBanner}>
        <View style={styles.trustItem}>
          <ShieldCheck color={colors.success} size={20} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.trustTitle, typography.captionBold]}>Transit Insurance</Text>
            <Text style={[styles.trustSub, typography.micro]}>₹10,000 cover @ ₹15</Text>
          </View>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Clock color={colors.primary} size={20} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.trustTitle, typography.captionBold]}>Live GPS Tracking</Text>
            <Text style={[styles.trustSub, typography.micro]}>Real-time rider ETA</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: 54,
    paddingBottom: 110,
    gap: spacing.base,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  locationSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  locationIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  locationLabel: {
    color: colors.textPrimary,
  },
  locationText: {
    color: colors.textSecondary,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarCircle: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  greetingSub: {
    color: colors.textSecondary,
  },
  greetingName: {
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  lightningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 4,
  },
  lightningText: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  activeOrderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.primaryMuted,
  },
  activeOrderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  activeOrderTrackingCode: {
    color: colors.textPrimary,
  },
  orderOtpBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  orderOtpTitle: {
    color: colors.successDark,
  },
  orderOtpCodeBox: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#059669',
  },
  orderOtpDigits: {
    color: '#059669',
    fontWeight: '900',
    letterSpacing: 2,
  },
  activeOrderBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  activeOrderLabel: {
    color: colors.textMuted,
  },
  activeOrderDestination: {
    color: colors.textPrimary,
    marginVertical: 2,
  },
  activeOrderEta: {
    color: colors.primary,
    fontWeight: '700',
  },
  trackOrderBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    gap: 8,
  },
  trackOrderBtnText: {
    color: '#FFFFFF',
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroLeft: {
    flex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 4,
    lineHeight: 18,
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    gap: 8,
  },
  heroCtaText: {
    color: colors.primary,
  },
  heroArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRight: {
    marginLeft: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  vehicleCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  vehicleCardActive: {
    backgroundColor: '#FFF7ED',
    borderColor: colors.primary,
  },
  vehicleCardInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  vehicleTitle: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 12,
  },
  vehicleSubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 2,
    fontSize: 10,
  },
  vehicleFareTag: {
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    marginTop: 4,
  },
  vehicleFareText: {
    color: colors.textPrimary,
    fontSize: 11,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetCard: {
    width: (SCREEN_WIDTH - spacing.base * 2 - spacing.sm * 2) / 3,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  presetIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  presetTitle: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 12,
  },
  presetSubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 10,
    marginTop: 1,
  },
  promoCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  promoLeft: {
    flex: 1,
  },
  promoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  promoPillText: {
    color: '#B45309',
    fontWeight: '800',
  },
  promoTitle: {
    color: colors.textPrimary,
  },
  promoDesc: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  promoApplyBtn: {
    backgroundColor: '#B45309',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  promoApplyBtnText: {
    color: '#FFFFFF',
  },
  trustBanner: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
  },
  trustItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: spacing.sm,
  },
  trustTitle: {
    color: colors.textPrimary,
  },
  trustSub: {
    color: colors.textSecondary,
  },
});

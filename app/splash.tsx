import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { BikeCourierIllustration } from '../src/components/illustrations/BikeCourierIllustration';
import { colors, spacing, typography, borderRadius } from '../src/theme';
import { localStorageService } from '../src/services/storage/asyncStorage';
import { useAuthStore } from '../src/store/useAuthStore';
import { useAddressStore } from '../src/store/useAddressStore';
import { useOrdersStore } from '../src/store/useOrdersStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // Animation shared values
  const bikeTranslateX = useSharedValue(-SCREEN_WIDTH * 0.7);
  const bikeScale = useSharedValue(0.9);
  const bikeRotation = useSharedValue(-4); // leaning forward during acceleration
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(20);
  const progressWidth = useSharedValue(0);
  const containerScale = useSharedValue(1);
  const containerOpacity = useSharedValue(1);

  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateAddresses = useAddressStore((s) => s.hydrate);
  const hydrateOrders = useOrdersStore((s) => s.hydrate);

  const navigateNext = (target: string) => {
    router.replace(target as any);
  };

  useEffect(() => {
    // 1. Bike accelerates into center with spring bounce and levels out
    bikeTranslateX.value = withSpring(0, {
      damping: 15,
      stiffness: 90,
      mass: 0.8,
    });
    bikeRotation.value = withDelay(
      350,
      withSpring(0, { damping: 10, stiffness: 100 })
    );
    bikeScale.value = withSpring(1, { damping: 12, stiffness: 140 });

    // 2. Logo and slogan reveal after bike halts in center
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    logoTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 14, stiffness: 160 })
    );

    // 3. Loading progress bar fills up smoothly
    progressWidth.value = withTiming(1, {
      duration: 1800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    const bootstrap = async () => {
      // Hydrate all stores in parallel while animations play
      await Promise.all([hydrateAuth(), hydrateAddresses(), hydrateOrders()]);

      const onboardingDone = await localStorageService.getOnboardingCompleted();
      const currentUser = await localStorageService.getUserProfile();

      let targetRoute = '/(tabs)';
      if (!onboardingDone) {
        targetRoute = '/onboarding';
      } else if (!currentUser) {
        targetRoute = '/(auth)/login';
      }

      // 4. Smooth exit zoom transition
      setTimeout(() => {
        containerScale.value = withTiming(1.08, { duration: 350 });
        containerOpacity.value = withTiming(0, { duration: 350 }, (finished) => {
          if (finished) {
            runOnJS(navigateNext)(targetRoute);
          }
        });
      }, 2100);
    };

    bootstrap();
  }, []);

  const bikeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bikeTranslateX.value },
      { scale: bikeScale.value },
      { rotate: `${bikeRotation.value}deg` },
    ],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Ambient background glow */}
      <View style={styles.ambientGlow} />

      <View style={styles.centerStage}>
        {/* Animated Bike Parcel Courier */}
        <Animated.View style={[styles.bikeWrap, bikeAnimatedStyle]}>
          <BikeCourierIllustration size={180} showMotionLines={true} />
        </Animated.View>

        {/* Animated Brand Typography */}
        <Animated.View style={[styles.textWrap, logoAnimatedStyle]}>
          <Text style={[styles.brandTitle, typography.hero]}>
            Parcel<Text style={styles.brandTitleAccent}>Go</Text>
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.pulseDot} />
            <Text style={[styles.tagline, typography.body]}>
              Instant Courier & Cargo Delivery
            </Text>
          </View>
        </Animated.View>

        {/* Animated Loading Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
          </View>
          <Text style={[styles.loadingHint, typography.micro]}>
            FAST • SECURE • OTP VERIFIED
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, typography.micro]}>
          POWERED BY PARCELGO CORE v2.0
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Sleek dark stage for vibrant electric orange glow
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  ambientGlow: {
    position: 'absolute',
    top: '30%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FF5E00',
    opacity: 0.12,
  },
  centerStage: {
    alignItems: 'center',
    width: '100%',
  },
  bikeWrap: {
    marginBottom: spacing.lg,
  },
  textWrap: {
    alignItems: 'center',
  },
  brandTitle: {
    color: '#FFFFFF',
    letterSpacing: -1.5,
    fontSize: 42,
    fontWeight: '900',
  },
  brandTitleAccent: {
    color: colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  tagline: {
    color: '#94A3B8',
    fontWeight: '500',
    fontSize: 14,
  },
  progressContainer: {
    width: 200,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  loadingHint: {
    color: '#64748B',
    marginTop: spacing.sm,
    letterSpacing: 1,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 36,
  },
  footerText: {
    color: '#475569',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
});

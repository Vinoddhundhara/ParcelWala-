import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInRight,
  FadeOutLeft,
} from 'react-native-reanimated';
import { PackageIllustration } from '../src/components/illustrations/PackageIllustration';
import { Button } from '../src/components/common/Button';
import { colors, borderRadius, spacing, typography } from '../src/theme';
import { localStorageService } from '../src/services/storage/asyncStorage';
import { ParcelCategory } from '../src/types';

interface OnboardingSlide {
  id: number;
  category: ParcelCategory;
  title: string;
  highlight: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    category: 'small',
    title: 'Book a parcel in',
    highlight: 'seconds',
    description:
      'From important documents to heavy cartons, request instant doorstep pickup with transparent upfront pricing.',
  },
  {
    id: 2,
    category: 'fragile',
    title: 'Track your delivery',
    highlight: 'live on map',
    description:
      'Watch verified couriers navigate in real time. Receive minute-by-minute status updates until safe handoff.',
  },
  {
    id: 3,
    category: 'large',
    title: 'Know your price',
    highlight: 'upfront & clear',
    description:
      'Exact INR fares based on distance and parcel weight. No surge pricing surprises or hidden platform markups.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slide = SLIDES[currentSlideIndex];
  const isLast = currentSlideIndex === SLIDES.length - 1;

  const handleFinish = async () => {
    await localStorageService.setOnboardingCompleted(true);
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <View style={styles.container}>
      {/* Top Header / Skip Button */}
      <View style={styles.header}>
        <View style={styles.logoPill}>
          <Text style={[styles.logoText, typography.captionBold]}>
            PARCEL<Text style={{ color: colors.primary }}>GO</Text>
          </Text>
        </View>

        {!isLast && (
          <Pressable onPress={handleSkip} hitSlop={12}>
            <Text style={[styles.skipText, typography.bodyBold]}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Slide Content with Dynamic Package Illustration */}
      <View style={styles.contentWrap}>
        <Animated.View
          key={`illustration_${slide.id}`}
          entering={FadeInRight.springify()}
          exiting={FadeOutLeft}
          style={styles.illustrationCard}
        >
          <PackageIllustration category={slide.category} size={160} />
        </Animated.View>

        <Animated.View
          key={`text_${slide.id}`}
          entering={FadeInRight.delay(100)}
          exiting={FadeOutLeft}
          style={styles.textContainer}
        >
          <Text style={[styles.title, typography.hero]}>
            {slide.title} <Text style={styles.titleHighlight}>{slide.highlight}</Text>
          </Text>
          <Text style={[styles.description, typography.bodyLarge]}>{slide.description}</Text>
        </Animated.View>
      </View>

      {/* Footer / Pagination & CTA */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentSlideIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <Button
          title={isLast ? 'Get Started' : 'Next'}
          onPress={handleNext}
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoPill: {
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  logoText: {
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  skipText: {
    color: colors.textSecondary,
  },
  contentWrap: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  illustrationCard: {
    width: 220,
    height: 220,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.surfaceBorderLight,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  titleHighlight: {
    color: colors.primary,
  },
  description: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  footer: {
    gap: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.surfaceBorder,
  },
});

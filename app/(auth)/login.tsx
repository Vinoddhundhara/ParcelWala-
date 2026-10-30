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
import { ShieldCheck, Info } from 'lucide-react-native';
import { PhoneInput } from '../../src/components/forms/PhoneInput';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { phoneSchema, getFirstZodError } from '../../src/utils/validation';
import { ENV } from '../../src/config/env';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('9876543210');
  const [error, setError] = useState<string | undefined>(undefined);

  const requestOtp = useAuthStore((s) => s.requestOtp);
  const isLoading = useAuthStore((s) => s.isLoading);

  const handleSendOtp = async () => {
    const parse = phoneSchema.safeParse(phone);
    if (!parse.success) {
      setError(getFirstZodError(parse.error));
      return;
    }
    setError(undefined);

    try {
      await requestOtp(parse.data);
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: parse.data },
      });
    } catch (err: unknown) {
      setError((err as Error)?.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.logoBadge}>
              <Text style={[styles.logoText, typography.captionBold]}>
                PARCEL<Text style={{ color: colors.primary }}>GO</Text>
              </Text>
            </View>
          </View>

          <Text style={[styles.title, typography.hero]}>Welcome to ParcelGo</Text>
          <Text style={[styles.subtitle, typography.bodyLarge]}>
            Enter your mobile number to book, track, and manage deliveries.
          </Text>
        </View>

        {/* Development Environment Notice */}
        <View style={styles.devNoticeCard}>
          <Info color={colors.info} size={20} style={{ marginRight: spacing.sm }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.devNoticeTitle, typography.captionBold]}>
              Development Testing Mode
            </Text>
            <Text style={[styles.devNoticeBody, typography.caption]}>
              Predictable test OTP is <Text style={{ fontWeight: '700' }}>{ENV.DEV_TEST_OTP}</Text>.
              (No live SMS is billed or sent).
            </Text>
          </View>
        </View>

        {/* Input & Action */}
        <View style={styles.formSection}>
          <PhoneInput
            value={phone}
            onChangePhone={(val) => {
              setPhone(val);
              if (error) setError(undefined);
            }}
            error={error}
            autoFocus
          />

          <Button
            title="Get Verification OTP"
            onPress={handleSendOtp}
            loading={isLoading}
            size="lg"
            variant="primary"
          />
        </View>

        {/* Terms & Privacy */}
        <View style={styles.footer}>
          <View style={styles.securityRow}>
            <ShieldCheck color={colors.success} size={16} />
            <Text style={[styles.securityText, typography.micro]}>
              100% Secure • Verified Courier Network
            </Text>
          </View>

          <Text style={[styles.termsText, typography.micro]}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
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
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 70,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  logoBadge: {
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  logoText: {
    color: colors.textPrimary,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  devNoticeCard: {
    flexDirection: 'row',
    backgroundColor: colors.infoSoft,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  devNoticeTitle: {
    color: colors.infoDark,
    marginBottom: 2,
  },
  devNoticeBody: {
    color: colors.infoDark,
  },
  formSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    color: colors.textSecondary,
  },
  termsText: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

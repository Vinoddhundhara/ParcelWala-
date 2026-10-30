import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react-native';
import { OtpInput } from '../../src/components/forms/OtpInput';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { ENV } from '../../src/config/env';

export default function OtpVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = params.phone || '9876543210';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [countdown, setCountdown] = useState(ENV.OTP_RESEND_COOLDOWN_SEC);

  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setError(undefined);

    try {
      const res = await verifyOtp(phone, otp);
      if (res.isNewUser) {
        router.replace('/(auth)/profile-setup');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await requestOtp(phone);
      setCountdown(ENV.OTP_RESEND_COOLDOWN_SEC);
      setError(undefined);
    } catch (err: unknown) {
      setError((err as Error)?.message);
    }
  };

  const handleUseDevOtp = () => {
    setOtp(ENV.DEV_TEST_OTP);
    setError(undefined);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Go back"
        >
          <ArrowLeft color={colors.textPrimary} size={24} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, typography.hero]}>Verify Mobile</Text>
          <Text style={[styles.subtitle, typography.bodyLarge]}>
            We sent a 6-digit code to <Text style={styles.phoneHighlight}>+91 {phone}</Text>
          </Text>
        </View>

        {/* Dev OTP Fast Fill helper */}
        <Pressable style={styles.devAutoFillPill} onPress={handleUseDevOtp}>
          <Sparkles color={colors.primary} size={16} />
          <Text style={[styles.devAutoFillText, typography.captionBold]}>
            Fill Dev OTP: {ENV.DEV_TEST_OTP}
          </Text>
        </Pressable>

        {/* 6 Digit Input Boxes */}
        <View style={styles.otpSection}>
          <OtpInput
            value={otp}
            onChangeOtp={(val) => {
              setOtp(val);
              if (error) setError(undefined);
            }}
            error={error}
          />

          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={[styles.resendTimer, typography.body]}>
                Resend code in <Text style={{ fontWeight: '700' }}>0:{countdown < 10 ? `0${countdown}` : countdown}</Text>
              </Text>
            ) : (
              <Pressable onPress={handleResend} style={styles.resendBtn}>
                <RefreshCw color={colors.primary} size={16} style={{ marginRight: 6 }} />
                <Text style={[styles.resendText, typography.bodyBold]}>Resend OTP</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Submit */}
        <View style={styles.footer}>
          <Button
            title="Verify & Continue"
            onPress={handleVerify}
            loading={isLoading}
            disabled={otp.length !== 6}
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
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  phoneHighlight: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  devAutoFillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 6,
  },
  devAutoFillText: {
    color: colors.primaryDark,
  },
  otpSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xl,
  },
  resendRow: {
    marginTop: spacing.md,
  },
  resendTimer: {
    color: colors.textMuted,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    color: colors.primary,
  },
  footer: {
    width: '100%',
  },
});

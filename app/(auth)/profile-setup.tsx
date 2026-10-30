import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail } from 'lucide-react-native';
import { Input } from '../../src/components/forms/Input';
import { Button } from '../../src/components/common/Button';
import { colors, spacing, typography } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [name, setName] = useState('Olivia Smith');
  const [email, setEmail] = useState('olivia.smith@example.com');
  const [error, setError] = useState<string | undefined>(undefined);

  const updateProfile = useAuthStore((s) => s.updateProfile);
  const isLoading = useAuthStore((s) => s.isLoading);

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError(undefined);

    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to save profile');
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
          <Text style={[styles.title, typography.hero]}>Set up your profile</Text>
          <Text style={[styles.subtitle, typography.bodyLarge]}>
            Enter your details so couriers and recipients know who sent the package.
          </Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.formSection}>
          <Input
            label="Full Name *"
            value={name}
            onChangeText={(val) => {
              setName(val);
              if (error) setError(undefined);
            }}
            placeholder="e.g. Olivia Smith"
            leftIcon={<User color={colors.textSecondary} size={20} />}
            error={error}
            autoFocus
          />

          <Input
            label="Email Address (Optional)"
            value={email}
            onChangeText={setEmail}
            placeholder="e.g. olivia@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail color={colors.textSecondary} size={20} />}
            helperText="We'll send digital delivery receipts and tracking links here."
          />
        </View>

        {/* Submit */}
        <View style={styles.footer}>
          <Button
            title="Complete Setup"
            onPress={handleSave}
            loading={isLoading}
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
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  formSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  footer: {
    width: '100%',
  },
});


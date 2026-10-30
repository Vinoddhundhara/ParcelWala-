import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';

export interface PhoneInputProps {
  label?: string;
  value: string;
  onChangePhone: (phone: string) => void;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  placeholder?: string;
  autoFocus?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label = 'Mobile Number',
  value,
  onChangePhone,
  error,
  helperText,
  containerStyle,
  placeholder = '98765 43210',
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (text: string) => {
    // Keep numbers only and limit to 10 digits
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    onChangePhone(cleaned);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, typography.bodyBold]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          !!error && styles.errorBorder,
        ]}
      >
        <View style={styles.prefixBadge}>
          <Text style={styles.flag}>🇮🇳</Text>
          <Text style={[styles.prefixText, typography.bodyBold]}>+91</Text>
        </View>

        <View style={styles.divider} />

        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          maxLength={10}
          autoFocus={autoFocus}
          style={[styles.input, typography.h3]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error ? (
        <Text style={[styles.errorText, typography.caption]}>{error}</Text>
      ) : helperText ? (
        <Text style={[styles.helperText, typography.caption]}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
    width: '100%',
  },
  label: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  errorBorder: {
    borderColor: colors.danger,
  },
  prefixBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  flag: {
    fontSize: 20,
    marginRight: 6,
  },
  prefixText: {
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.surfaceBorder,
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    letterSpacing: 1.5,
  },
  errorText: {
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  helperText: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});


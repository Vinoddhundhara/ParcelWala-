import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  NativeSyntheticEvent,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChangeOtp: (otp: string) => void;
  error?: string;
  autoFocus?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChangeOtp,
  error,
  autoFocus = true,
}) => {
  const inputsRef = useRef<any[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const digits = value.split('');

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/\D/g, '');

    // Handle full paste (e.g. 6 digits pasted at once)
    if (clean.length > 1) {
      const pasted = clean.slice(0, length);
      onChangeOtp(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean;
    const newOtp = newDigits.join('').slice(0, length);
    onChangeOtp(newOtp);

    // Auto-advance to next box if digit entered
    if (clean && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<{ key: string }>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChangeOtp(newDigits.join(''));
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.boxContainer}>
        {Array.from({ length }).map((_, index) => {
          const digit = digits[index] || '';
          const isCurrentFocused = focusedIndex === index;

          return (
            <TextInput
              key={index}
              ref={(ref) => {
                inputsRef.current[index] = ref;
              }}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={autoFocus && index === 0}
              selectTextOnFocus
              style={[
                styles.box,
                typography.h2,
                isCurrentFocused && styles.boxFocused,
                !!error && styles.boxError,
                !!digit && styles.boxFilled,
              ]}
              accessibilityLabel={`OTP digit ${index + 1}`}
            />
          );
        })}
      </View>
      {error && <Text style={[styles.errorText, typography.caption]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  boxFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  boxFilled: {
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surfaceSubtle,
  },
  boxError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

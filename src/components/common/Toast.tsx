import React, { createContext, useContext, useState, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
} from 'react-native-reanimated';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback(({ message, type = 'info', durationMs = 3500 }: ToastOptions) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, durationMs);
  }, []);

  const getIcon = () => {
    if (!toast) return null;
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 color={colors.success} size={20} />;
      case 'error':
        return <AlertCircle color={colors.danger} size={20} />;
      case 'info':
      default:
        return <Info color={colors.info} size={20} />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          entering={FadeInUp.springify().damping(16)}
          exiting={FadeOutUp}
          style={[styles.toastContainer, shadows.lg]}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>{getIcon()}</View>
            <Text style={[styles.message, typography.bodyMedium]}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    backgroundColor: '#1E293B',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  message: {
    color: '#FFFFFF',
    flex: 1,
  },
});

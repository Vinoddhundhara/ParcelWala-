import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check, Circle } from 'lucide-react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { OrderStatus } from '../../types';

export interface StatusStepperProps {
  currentStatus: OrderStatus;
  simplified?: boolean;
}

interface StepConfig {
  key: OrderStatus;
  label: string;
}

const STEPS: StepConfig[] = [
  { key: 'created', label: 'Placed' },
  { key: 'driver_assigned', label: 'Assigned' },
  { key: 'pickup_complete', label: 'Picked Up' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

export const StatusStepper: React.FC<StatusStepperProps> = ({
  currentStatus,
  simplified = false,
}) => {
  const isCancelled = currentStatus === 'cancelled';

  if (isCancelled) {
    return (
      <View style={styles.cancelledContainer}>
        <Text style={[styles.cancelledText, typography.bodyBold]}>Order Cancelled</Text>
      </View>
    );
  }

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'created':
        return 0;
      case 'driver_assigned':
      case 'arriving_pickup':
        return 1;
      case 'pickup_complete':
        return 2;
      case 'in_transit':
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <View style={styles.container}>
      <View style={styles.trackRow}>
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isLast = idx === STEPS.length - 1;

          return (
            <React.Fragment key={step.key}>
              {/* Step Node */}
              <View style={styles.nodeColumn}>
                <View
                  style={[
                    styles.node,
                    isCompleted && styles.nodeCompleted,
                    isCurrent && styles.nodeCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <Check color="#FFFFFF" size={12} strokeWidth={3} />
                  ) : isCurrent ? (
                    <View style={styles.pulsingCore} />
                  ) : (
                    <View style={styles.pendingCore} />
                  )}
                </View>
                {!simplified && (
                  <Text
                    style={[
                      styles.stepLabel,
                      isCurrent && styles.stepLabelActive,
                      isCompleted && styles.stepLabelCompleted,
                      typography.micro,
                    ]}
                    numberOfLines={1}
                  >
                    {step.label}
                  </Text>
                )}
              </View>

              {/* Connecting Line between steps */}
              {!isLast && (
                <View
                  style={[
                    styles.connectingLine,
                    idx < activeIndex && styles.connectingLineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.sm,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 50,
  },
  node: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCompleted: {
    backgroundColor: colors.success,
  },
  nodeCurrent: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primarySoft,
  },
  pulsingCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  pendingCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  connectingLine: {
    flex: 1,
    height: 3,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: -4,
    marginBottom: 16,
  },
  connectingLineCompleted: {
    backgroundColor: colors.success,
  },
  stepLabel: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  stepLabelCompleted: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  cancelledContainer: {
    padding: spacing.md,
    backgroundColor: colors.dangerSoft,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelledText: {
    color: colors.dangerDark,
  },
});


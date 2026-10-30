import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { colors, borderRadius, typography } from '../../theme';
import { OrderStatus } from '../../types';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  status?: OrderStatus;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant,
  status,
  style,
  textStyle,
  size = 'md',
}) => {
  const getBadgeColors = () => {
    if (status) {
      switch (status) {
        case 'delivered':
          return { bg: colors.successSoft, text: colors.successDark };
        case 'in_transit':
        case 'out_for_delivery':
          return { bg: colors.infoSoft, text: colors.infoDark };
        case 'driver_assigned':
        case 'arriving_pickup':
        case 'pickup_complete':
          return { bg: colors.primarySoft, text: colors.primaryDark };
        case 'cancelled':
          return { bg: colors.dangerSoft, text: colors.dangerDark };
        case 'created':
        default:
          return { bg: colors.warningSoft, text: colors.warningDark };
      }
    }

    switch (variant) {
      case 'primary':
        return { bg: colors.primarySoft, text: colors.primaryDark };
      case 'success':
        return { bg: colors.successSoft, text: colors.successDark };
      case 'warning':
        return { bg: colors.warningSoft, text: colors.warningDark };
      case 'danger':
        return { bg: colors.dangerSoft, text: colors.dangerDark };
      case 'info':
        return { bg: colors.infoSoft, text: colors.infoDark };
      case 'neutral':
      default:
        return { bg: colors.surfaceSubtle, text: colors.textSecondary };
    }
  };

  const badgeTheme = getBadgeColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeTheme.bg,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 8 : 10,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' ? typography.micro : typography.captionBold,
          { color: badgeTheme.text },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textTransform: 'capitalize',
  },
});


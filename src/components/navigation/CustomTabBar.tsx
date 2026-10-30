import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Home, PackageCheck, Navigation, User } from 'lucide-react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { useOrdersStore } from '../../store/useOrdersStore';

export type CustomTabBarProps = any;

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
export const CustomTabBar: React.FC<CustomTabBarProps> = (props) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeOrderId = useOrdersStore((s) => s.activeOrderId);

  const { state, descriptors, navigation } = props || {};

  if (!state || !state.routes) {
    return null;
  }

  const getTabIcon = (name: string, isFocused: boolean) => {
    const color = isFocused ? colors.primary : colors.textMuted;
    const size = 22;

    switch (name) {
      case 'index':
        return <Home color={color} size={size} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'orders':
        return <PackageCheck color={color} size={size} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'track':
        return <Navigation color={color} size={size} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'profile':
        return <User color={color} size={size} strokeWidth={isFocused ? 2.5 : 2} />;
      default:
        return <Home color={color} size={size} />;
    }
  };

  const getTabLabel = (name: string) => {
    switch (name) {
      case 'index':
        return 'Home';
      case 'orders':
        return 'My Orders';
      case 'track':
        return 'Track';
      case 'profile':
        return 'Profile';
      default:
        return name;
    }
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={[styles.container, shadows.lg]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const options = descriptors?.[route.key]?.options || {};
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            let defaultPrevented = false;

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            if (navigation?.emit) {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              defaultPrevented = event?.defaultPrevented;
            }

            if (!isFocused && !defaultPrevented) {
              if (navigation?.navigate) {
                navigation.navigate(route.name);
              } else if (route.name === 'index') {
                router.replace('/(tabs)');
              } else {
                router.replace(`/(tabs)/${route.name}` as any);
              }
            }
          };

          const isTrack = route.name === 'track';
          const hasActiveOrder = isTrack && !!activeOrderId;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={[
                styles.tabButton,
                isFocused && styles.tabButtonFocused,
              ]}
            >
              <View style={styles.iconContainer}>
                {getTabIcon(route.name, isFocused)}
                {hasActiveOrder && <View style={styles.livePulseDot} />}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  typography.micro,
                  {
                    color: isFocused ? colors.primary : colors.textMuted,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}
              >
                {getTabLabel(route.name)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.base,
    pointerEvents: 'box-none',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.surfaceBorderLight,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  tabButtonFocused: {
    backgroundColor: colors.primarySoft,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulseDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  tabLabel: {
    marginTop: 2,
  },
});

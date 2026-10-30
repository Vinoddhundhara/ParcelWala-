import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  MapPin,
  Package,
  Bell,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  Edit2,
} from 'lucide-react-native';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useAddressStore } from '../../src/store/useAddressStore';
import { useOrdersStore } from '../../src/store/useOrdersStore';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthLoaded = useAuthStore((s) => s.isLoaded);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const logout = useAuthStore((s) => s.logout);
  const addressesCount = useAddressStore((s) => s.addresses.length);
  const hydrateAddresses = useAddressStore((s) => s.hydrate);
  const ordersCount = useOrdersStore((s) => s.orders.length);
  const hydrateOrders = useOrdersStore((s) => s.hydrate);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  React.useEffect(() => {
    if (!isAuthLoaded) {
      hydrateAuth();
      hydrateAddresses();
      hydrateOrders();
    }
  }, [isAuthLoaded]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of ParcelGo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[styles.title, typography.h1]}>My Profile</Text>
      </View>

      {/* Customer Avatar & Info Card */}
      <View style={[styles.profileCard, shadows.sm]}>
        <View style={styles.avatarWrap}>
          <Text style={[styles.avatarText, typography.h1]}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </Text>
        </View>

        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={[styles.userName, typography.h3]}>
            {user?.name || 'Olivia Smith'}
          </Text>
          <View style={styles.phoneBadgeRow}>
            <Phone color={colors.textSecondary} size={13} />
            <Text style={[styles.userPhone, typography.caption]}>
              +91 {user?.phone || '9876543210'}
            </Text>
            <View style={styles.verifiedBadge}>
              <ShieldCheck color={colors.success} size={12} />
              <Text style={[styles.verifiedText, typography.micro]}>VERIFIED</Text>
            </View>
          </View>

          {user?.email && (
            <View style={styles.emailRow}>
              <Mail color={colors.textMuted} size={13} />
              <Text style={[styles.userEmail, typography.caption]}>{user.email}</Text>
            </View>
          )}
        </View>

        <Pressable
          style={styles.editProfileBtn}
          onPress={() => router.push('/(auth)/profile-setup')}
          accessibilityLabel="Edit profile name"
        >
          <Edit2 color={colors.primary} size={16} />
        </Pressable>
      </View>

      {/* Stats Summary Row */}
      <View style={styles.statsRow}>
        <Pressable
          style={[styles.statBox, shadows.sm]}
          onPress={() => router.push('/(tabs)/orders')}
        >
          <Package color={colors.primary} size={22} style={{ marginBottom: 4 }} />
          <Text style={[styles.statValue, typography.h3]}>{ordersCount}</Text>
          <Text style={[styles.statLabel, typography.caption]}>Total Deliveries</Text>
        </Pressable>

        <Pressable
          style={[styles.statBox, shadows.sm]}
          onPress={() => router.push('/addresses')}
        >
          <MapPin color="#3B82F6" size={22} style={{ marginBottom: 4 }} />
          <Text style={[styles.statValue, typography.h3]}>{addressesCount}</Text>
          <Text style={[styles.statLabel, typography.caption]}>Saved Addresses</Text>
        </Pressable>
      </View>

      {/* Menu Sections */}
      <View style={styles.menuGroup}>
        <Text style={[styles.menuGroupTitle, typography.captionBold]}>ACCOUNT & ADDRESSES</Text>

        <Pressable
          style={[styles.menuItem, shadows.sm]}
          onPress={() => router.push('/addresses')}
        >
          <View style={[styles.menuIconWrap, { backgroundColor: '#EFF6FF' }]}>
            <MapPin color="#3B82F6" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuItemTitle, typography.bodyBold]}>Address Book</Text>
            <Text style={[styles.menuItemSubtitle, typography.caption]}>
              Manage Home, Work and frequent drop locations
            </Text>
          </View>
          <ChevronRight color={colors.textMuted} size={18} />
        </Pressable>

        <View style={[styles.menuItem, shadows.sm]}>
          <View style={[styles.menuIconWrap, { backgroundColor: '#ECFDF5' }]}>
            <Bell color={colors.success} size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuItemTitle, typography.bodyBold]}>Order Status Alerts</Text>
            <Text style={[styles.menuItemSubtitle, typography.caption]}>
              Push notifications for courier arrival & delivery
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
          />
        </View>
      </View>

      {/* Support & Legal */}
      <View style={styles.menuGroup}>
        <Text style={[styles.menuGroupTitle, typography.captionBold]}>HELP & LEGAL</Text>

        <Pressable
          style={[styles.menuItem, shadows.sm]}
          onPress={() => router.push('/support')}
        >
          <View style={[styles.menuIconWrap, { backgroundColor: colors.primarySoft }]}>
            <HelpCircle color={colors.primary} size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuItemTitle, typography.bodyBold]}>Help & Support Center</Text>
            <Text style={[styles.menuItemSubtitle, typography.caption]}>
              FAQs, issue reporting & 24/7 courier helpline
            </Text>
          </View>
          <ChevronRight color={colors.textMuted} size={18} />
        </Pressable>

        <Pressable
          style={[styles.menuItem, shadows.sm]}
          onPress={() =>
            Alert.alert(
              'Terms of Service',
              '1. Transparent pricing with verified weight audit.\n\n2. Prohibited goods (hazardous chemicals, fireworks) are strictly disallowed.\n\n3. Free cancellation before courier arrival.'
            )
          }
        >
          <View style={[styles.menuIconWrap, { backgroundColor: '#F5F3FF' }]}>
            <FileText color="#8B5CF6" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuItemTitle, typography.bodyBold]}>Terms of Service</Text>
            <Text style={[styles.menuItemSubtitle, typography.caption]}>
              Delivery conditions and parcel liability
            </Text>
          </View>
          <ChevronRight color={colors.textMuted} size={18} />
        </Pressable>

        <Pressable
          style={[styles.menuItem, shadows.sm]}
          onPress={() =>
            Alert.alert(
              'Privacy Disclosure',
              'We store only location coordinates necessary for ongoing delivery route calculation. Contact numbers are masked between customers and couriers.'
            )
          }
        >
          <View style={[styles.menuIconWrap, { backgroundColor: '#FEF2F2' }]}>
            <Shield color="#EF4444" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuItemTitle, typography.bodyBold]}>Privacy Policy</Text>
            <Text style={[styles.menuItemSubtitle, typography.caption]}>
              Data privacy and GPS permission disclosures
            </Text>
          </View>
          <ChevronRight color={colors.textMuted} size={18} />
        </Pressable>
      </View>

      {/* Logout Action */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut color={colors.danger} size={18} style={{ marginRight: spacing.sm }} />
        <Text style={[styles.logoutText, typography.bodyBold]}>Log Out of ParcelGo</Text>
      </Pressable>

      <Text style={[styles.versionFooter, typography.micro]}>ParcelGo Android App • v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: 54,
    paddingBottom: 110,
  },
  header: {
    marginBottom: spacing.base,
  },
  title: {
    color: colors.textPrimary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.base,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
  },
  userName: {
    color: colors.textPrimary,
  },
  phoneBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  userPhone: {
    color: colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: borderRadius.full,
    gap: 2,
  },
  verifiedText: {
    color: colors.successDark,
    fontWeight: '700',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  userEmail: {
    color: colors.textMuted,
  },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorderLight,
  },
  statValue: {
    color: colors.textPrimary,
  },
  statLabel: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuGroup: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  menuGroupTitle: {
    color: colors.textMuted,
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorderLight,
  },
  menuIconWrap: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemTitle: {
    color: colors.textPrimary,
  },
  menuItemSubtitle: {
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: colors.dangerDark,
  },
  versionFooter: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    letterSpacing: 0.5,
  },
});


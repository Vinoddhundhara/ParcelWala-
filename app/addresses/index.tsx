import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Home,
  Briefcase,
  MapPin,
  Trash2,
  CheckCircle2,
  Edit3,
} from 'lucide-react-native';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useAddressStore } from '../../src/store/useAddressStore';
import { Address } from '../../src/types';

export default function AddressBookScreen() {
  const router = useRouter();
  const addresses = useAddressStore((s) => s.addresses);
  const isLoaded = useAddressStore((s) => s.isLoaded);
  const hydrate = useAddressStore((s) => s.hydrate);
  const deleteAddress = useAddressStore((s) => s.deleteAddress);
  const setDefaultAddress = useAddressStore((s) => s.setDefaultAddress);

  React.useEffect(() => {
    if (!isLoaded) {
      hydrate();
    }
  }, [isLoaded]);

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home color={colors.primary} size={18} />;
      case 'Work':
        return <Briefcase color="#3B82F6" size={18} />;
      case 'Other':
      default:
        return <MapPin color="#8B5CF6" size={18} />;
    }
  };

  const handleDelete = (addr: Address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete ${addr.label} (${addr.streetAddress})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAddress(addr.id);
          },
        },
      ]
    );
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={[styles.addressCard, shadows.sm]}>
      <View style={styles.cardHeader}>
        <View style={styles.labelRow}>
          <View style={styles.labelIconWrap}>{getLabelIcon(item.label)}</View>
          <Text style={[styles.labelText, typography.bodyBold]}>
            {item.customLabel || item.label}
          </Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={[styles.defaultBadgeText, typography.micro]}>DEFAULT</Text>
            </View>
          )}
        </View>

        <Pressable
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
          hitSlop={10}
          accessibilityLabel="Delete address"
        >
          <Trash2 color={colors.danger} size={18} />
        </Pressable>
      </View>

      <Text style={[styles.streetAddress, typography.bodyBold]}>
        {item.streetAddress}
      </Text>
      {item.landmark && (
        <Text style={[styles.landmark, typography.caption]}>
          Landmark: {item.landmark}
        </Text>
      )}
      <Text style={[styles.cityPin, typography.caption]}>
        {item.city}, {item.state} - {item.postalCode}
      </Text>
      <Text style={[styles.contactInfo, typography.caption]}>
        Contact: {item.contactName} ({item.contactPhone})
      </Text>

      {!item.isDefault && (
        <Pressable
          style={styles.setDefaultBtn}
          onPress={() => setDefaultAddress(item.id)}
        >
          <CheckCircle2 color={colors.primary} size={14} style={{ marginRight: 6 }} />
          <Text style={[styles.setDefaultText, typography.captionBold]}>
            Set as Default Pickup
          </Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.textPrimary} size={22} />
        </Pressable>
        <Text style={[styles.title, typography.h2]}>Saved Addresses</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push('/addresses/new')}
          accessibilityLabel="Add new address"
        >
          <Plus color="#FFFFFF" size={18} />
        </Pressable>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderAddressItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MapPin color={colors.textMuted} size={54} style={{ marginBottom: spacing.sm }} />
            <Text style={[styles.emptyTitle, typography.h3]}>No Saved Addresses</Text>
            <Text style={[styles.emptySubtitle, typography.body]}>
              Add your frequent pickup and drop locations for faster parcel booking.
            </Text>
            <Button
              title="Add New Address"
              onPress={() => router.push('/addresses/new')}
              style={{ marginTop: spacing.lg, width: 200 }}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 54,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  title: {
    color: colors.textPrimary,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: 40,
    gap: spacing.base,
  },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    color: colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: colors.successSoft,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.full,
  },
  defaultBadgeText: {
    color: colors.successDark,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  streetAddress: {
    color: colors.textPrimary,
    marginBottom: 2,
  },
  landmark: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cityPin: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  contactInfo: {
    color: colors.textSecondary,
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderLight,
  },
  setDefaultText: {
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});


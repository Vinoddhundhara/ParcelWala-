import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search,
  Package,
  Calendar,
  ChevronRight,
  ArrowRight,
  Plus,
} from 'lucide-react-native';
import { Badge } from '../../src/components/common/Badge';
import { PackageIllustration } from '../../src/components/illustrations/PackageIllustration';
import { Button } from '../../src/components/common/Button';
import { colors, borderRadius, spacing, typography, shadows } from '../../src/theme';
import { useOrdersStore } from '../../src/store/useOrdersStore';
import { Order } from '../../src/types';

export default function MyOrdersScreen() {
  const router = useRouter();
  const orders = useOrdersStore((s) => s.orders);
  const isLoaded = useOrdersStore((s) => s.isLoaded);
  const hydrate = useOrdersStore((s) => s.hydrate);
  const selectedFilter = useOrdersStore((s) => s.selectedFilter);
  const setSelectedFilter = useOrdersStore((s) => s.setSelectedFilter);

  const [search, setSearch] = useState('');

  React.useEffect(() => {
    if (!isLoaded) {
      hydrate();
    }
  }, [isLoaded]);

  const filterTabs: { id: 'all' | 'active' | 'completed' | 'cancelled'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (selectedFilter === 'active') {
      if (['delivered', 'cancelled'].includes(order.status)) return false;
    } else if (selectedFilter === 'completed') {
      if (order.status !== 'delivered') return false;
    } else if (selectedFilter === 'cancelled') {
      if (order.status !== 'cancelled') return false;
    }

    // Search query filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchCode = order.trackingCode.toLowerCase().includes(q);
      const matchDesc = order.parcel.description.toLowerCase().includes(q);
      const matchDrop = order.dropAddress.streetAddress.toLowerCase().includes(q);
      return matchCode || matchDesc || matchDrop;
    }

    return true;
  });

  const renderOrderCard = ({ item }: { item: Order }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <Pressable
        style={[styles.orderCard, shadows.sm]}
        onPress={() => router.push(`/orders/${item.id}`)}
        accessibilityLabel={`Order ${item.trackingCode}`}
      >
        <View style={styles.cardTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.trackingCode, typography.bodyBold]}>{item.trackingCode}</Text>
          </View>
          <Badge status={item.status} label={item.status.replace('_', ' ')} />
        </View>

        <View style={styles.cardMidRow}>
          <PackageIllustration category={item.parcel.category} size={48} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[styles.parcelDesc, typography.bodyBold]} numberOfLines={1}>
              {item.parcel.description || `${item.parcel.category} Package`}
            </Text>
            <Text style={[styles.addressLine, typography.caption]} numberOfLines={1}>
              To: {item.dropAddress.streetAddress}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.dateWrap}>
                <Calendar color={colors.textMuted} size={12} style={{ marginRight: 4 }} />
                <Text style={[styles.dateText, typography.micro]}>{formattedDate}</Text>
              </View>
              <Text style={[styles.fareText, typography.bodyBold]}>
                ₹{item.fareBreakdown.totalInr}
              </Text>
            </View>
          </View>
          <ChevronRight color={colors.textMuted} size={20} />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[styles.title, typography.h1]}>My Orders</Text>
        <Pressable
          style={styles.newBookingBtn}
          onPress={() => router.push('/booking/pickup')}
          accessibilityLabel="Create new parcel booking"
        >
          <Plus color="#FFFFFF" size={16} />
          <Text style={[styles.newBookingBtnText, typography.captionBold]}>New Parcel</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search color={colors.textMuted} size={18} style={{ marginRight: spacing.sm }} />
        <TextInput
          placeholder="Search by Tracking ID, item or drop address..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, typography.body]}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {filterTabs.map((tab) => {
          const isSelected = selectedFilter === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tabChip, isSelected && styles.tabChipActive]}
              onPress={() => setSelectedFilter(tab.id)}
            >
              <Text
                style={[
                  styles.tabChipText,
                  typography.captionBold,
                  isSelected && { color: '#FFFFFF' },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package color={colors.textMuted} size={54} strokeWidth={1.5} style={{ marginBottom: spacing.md }} />
            <Text style={[styles.emptyTitle, typography.h3]}>No Orders Found</Text>
            <Text style={[styles.emptySubtitle, typography.body]}>
              {search
                ? 'No deliveries matched your search filter.'
                : 'You have not booked any parcel deliveries yet.'}
            </Text>
            <Button
              title="Book Your First Parcel"
              onPress={() => router.push('/booking/pickup')}
              style={{ marginTop: spacing.lg, width: 220 }}
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
  title: {
    color: colors.textPrimary,
  },
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  newBookingBtnText: {
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.base,
    height: 46,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  tabChip: {
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabChipText: {
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: 110,
    gap: spacing.base,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorderLight,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorderLight,
  },
  trackingCode: {
    color: colors.textPrimary,
  },
  cardMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parcelDesc: {
    color: colors.textPrimary,
  },
  addressLine: {
    color: colors.textSecondary,
    marginVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: colors.textMuted,
  },
  fareText: {
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
    marginBottom: 6,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

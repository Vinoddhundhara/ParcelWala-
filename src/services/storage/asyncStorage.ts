import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address, Order, UserProfile } from '../../types';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@parcelgo_onboarding_completed',
  USER_PROFILE: '@parcelgo_user_profile',
  SAVED_ADDRESSES: '@parcelgo_saved_addresses',
  ORDERS: '@parcelgo_orders',
  ACTIVE_DRAFT: '@parcelgo_booking_draft',
};

export const localStorageService = {
  // Onboarding
  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
  },
  async getOnboardingCompleted(): Promise<boolean> {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return val ? JSON.parse(val) : false;
  },

  // User Profile
  async saveUserProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },
  async getUserProfile(): Promise<UserProfile | null> {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return val ? JSON.parse(val) : null;
  },
  async clearUserProfile(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  },

  // Saved Addresses
  async saveAddresses(addresses: Address[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ADDRESSES, JSON.stringify(addresses));
  },
  async getAddresses(): Promise<Address[]> {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ADDRESSES);
    return val ? JSON.parse(val) : [];
  },

  // Orders
  async saveOrders(orders: Order[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },
  async getOrders(): Promise<Order[]> {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    return val ? JSON.parse(val) : [];
  },

  // Clear all for testing / logout
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.SAVED_ADDRESSES,
      STORAGE_KEYS.ORDERS,
      STORAGE_KEYS.ACTIVE_DRAFT,
    ]);
  },
};


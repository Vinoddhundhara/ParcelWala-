import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * SecureStorage Service
 * Uses Expo SecureStore for mobile (Android/iOS) and falls back safely to AsyncStorage for Web.
 */
class SecureStorageService {
  private isAvailable = Platform.OS !== 'web';

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isAvailable) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(`@secure_${key}`, value);
      }
    } catch {
      await AsyncStorage.setItem(`@secure_${key}`, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isAvailable) {
        return await SecureStore.getItemAsync(key);
      }
      return await AsyncStorage.getItem(`@secure_${key}`);
    } catch {
      return await AsyncStorage.getItem(`@secure_${key}`);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.isAvailable) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(`@secure_${key}`);
      }
    } catch {
      await AsyncStorage.removeItem(`@secure_${key}`);
    }
  }
}

export const secureStorage = new SecureStorageService();


import { create } from 'zustand';
import { UserProfile } from '../types';
import { authService } from '../services/auth/authService';
import { localStorageService } from '../services/storage/asyncStorage';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  requestOtp: (phone: string) => Promise<{ success: boolean; message: string; devHint?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ isNewUser: boolean }>;
  updateProfile: (updates: { name: string; email?: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoaded: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        set({ user, isAuthenticated: true, isLoaded: true });
      } else {
        set({ user: null, isAuthenticated: false, isLoaded: true });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoaded: true });
    }
  },

  requestOtp: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.requestOtp({ phone });
      set({ isLoading: false });
      return { success: true, message: res.message, devHint: res.devHint };
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to request OTP';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  verifyOtp: async (phone: string, otp: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.verifyOtp({ phone, otp, requestId: `req_${Date.now()}` });
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { isNewUser: res.isNewUser };
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Invalid OTP';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  updateProfile: async (updates: { name: string; email?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await authService.updateProfile(updates);
      set({ user: updated, isLoading: false });
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to update profile';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));


import { ENV } from '../../config/env';
import { UserProfile } from '../../types';
import {
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '../api/contracts';
import { secureStorage } from '../storage/secureStorage';
import { localStorageService } from '../storage/asyncStorage';
import { phoneSchema, otpSchema, getFirstZodError } from '../../utils/validation';

export interface IAuthService {
  requestOtp(params: RequestOtpRequest): Promise<RequestOtpResponse>;
  verifyOtp(params: VerifyOtpRequest): Promise<VerifyOtpResponse>;
  getCurrentUser(): Promise<UserProfile | null>;
  logout(): Promise<void>;
  updateProfile(profile: Partial<UserProfile>): Promise<UserProfile>;
}

/**
 * Clearly Labeled Development-Only Auth Adapter
 *
 * Simulates realistic network delay and provides the predictable test OTP (123456).
 * Explicitly displays development notice and NEVER claims an actual SMS was dispatched.
 */
export class DevAuthAdapter implements IAuthService {
  private inMemoryOtpStore: Map<string, string> = new Map();

  async requestOtp(params: RequestOtpRequest): Promise<RequestOtpResponse> {
    const parseRes = phoneSchema.safeParse(params.phone);
    if (!parseRes.success) {
      throw new Error(getFirstZodError(parseRes.error));
    }

    const cleanPhone = parseRes.data;

    // Simulate realistic 600ms latency
    await new Promise((res) => setTimeout(res, 600));

    const requestId = `req_dev_${Date.now()}`;
    const testOtp = ENV.DEV_TEST_OTP;
    this.inMemoryOtpStore.set(cleanPhone, testOtp);

    return {
      success: true,
      message: `[DEV ENVIRONMENT] Test OTP generated: ${testOtp}. (No real SMS is sent in mock mode).`,
      requestId,
      expiresInSeconds: 180,
      devHint: testOtp,
    };
  }

  async verifyOtp(params: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const phoneRes = phoneSchema.safeParse(params.phone);
    if (!phoneRes.success) {
      throw new Error('Invalid mobile number');
    }
    const otpRes = otpSchema.safeParse(params.otp);
    if (!otpRes.success) {
      throw new Error(getFirstZodError(otpRes.error));
    }

    const cleanPhone = phoneRes.data;
    const cleanOtp = otpRes.data;

    await new Promise((res) => setTimeout(res, 800));

    // Verify OTP against configured test OTP
    if (cleanOtp !== ENV.DEV_TEST_OTP) {
      throw new Error(`Invalid OTP. For development testing, use ${ENV.DEV_TEST_OTP}`);
    }

    const token = `dev_jwt_token_${cleanPhone}_${Date.now()}`;
    await secureStorage.setItem('auth_token', token);

    // Check if user already exists
    let existingUser = await localStorageService.getUserProfile();
    const isNewUser = !existingUser || existingUser.phone !== cleanPhone;

    const user: UserProfile = existingUser && existingUser.phone === cleanPhone
      ? existingUser
      : {
          id: `usr_${Date.now()}`,
          name: '',
          phone: cleanPhone,
          createdAt: new Date().toISOString(),
          isPhoneVerified: true,
        };

    await localStorageService.saveUserProfile(user);

    return {
      success: true,
      token,
      refreshToken: `dev_refresh_${Date.now()}`,
      isNewUser: !user.name,
      user,
    };
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const token = await secureStorage.getItem('auth_token');
    if (!token) return null;
    return await localStorageService.getUserProfile();
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getCurrentUser();
    if (!current) throw new Error('Not authenticated');

    const updated: UserProfile = {
      ...current,
      ...updates,
    };

    await localStorageService.saveUserProfile(updated);
    return updated;
  }

  async logout(): Promise<void> {
    await secureStorage.removeItem('auth_token');
    await localStorageService.clearUserProfile();
  }
}

/**
 * Production API Auth Service (Target Node.js backend)
 */
export class ProductionAuthService implements IAuthService {
  async requestOtp(params: RequestOtpRequest): Promise<RequestOtpResponse> {
    throw new Error('Production backend authentication not configured yet.');
  }
  async verifyOtp(params: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    throw new Error('Production backend authentication not configured yet.');
  }
  async getCurrentUser(): Promise<UserProfile | null> {
    throw new Error('Production backend authentication not configured yet.');
  }
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    throw new Error('Production backend authentication not configured yet.');
  }
  async logout(): Promise<void> {
    await secureStorage.removeItem('auth_token');
  }
}

// Factory export based on configuration
export const authService: IAuthService = ENV.USE_MOCK_SERVICES
  ? new DevAuthAdapter()
  : new ProductionAuthService();

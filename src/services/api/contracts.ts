/**
 * Backend Integration API Contract
 *
 * Prepared for future Node.js/Express + PostgreSQL/PostGIS backend.
 * Provides typed specifications for all customer application interactions.
 */

import {
  Address,
  FareBreakdown,
  Order,
  OrderStatus,
  ParcelDetails,
  PaymentDetails,
  ServiceType,
  SupportTicket,
  SupportTicketCategory,
  TrackingWaypoint,
  UserProfile,
} from '../../types';

// ================= AUTH CONTRACTS =================
export interface RequestOtpRequest {
  phone: string; // 10-digit Indian mobile number
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  requestId: string;
  expiresInSeconds: number;
  devHint?: string; // Only present in dev mode
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string; // 6 digits
  requestId: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  isNewUser: boolean;
  user: UserProfile;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ================= CUSTOMER PROFILE =================
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

// ================= ADDRESSES =================
export interface CreateAddressRequest extends Omit<Address, 'id'> {}

export interface UpdateAddressRequest extends Partial<Omit<Address, 'id'>> {}

// ================= ORDERS & QUOTE =================
export interface QuoteApiRequest {
  pickupAddress: {
    latitude: number;
    longitude: number;
    streetAddress: string;
    city: string;
  };
  dropAddress: {
    latitude: number;
    longitude: number;
    streetAddress: string;
    city: string;
  };
  parcel: ParcelDetails;
  serviceType: ServiceType;
  couponCode?: string;
}

export interface CreateOrderRequest {
  idempotencyKey: string;
  pickupAddress: Address;
  dropAddress: Address;
  parcel: ParcelDetails;
  serviceType: ServiceType;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod';
  couponCode?: string;
}

export interface CancelOrderRequest {
  reason: string;
  additionalNotes?: string;
}

export interface CancelOrderResponse {
  success: boolean;
  orderId: string;
  status: OrderStatus;
  refundAmountInr?: number;
  refundStatus?: 'initiated' | 'not_applicable' | 'failed';
  message: string;
}

// ================= TRACKING =================
export interface TrackingApiResponse {
  orderId: string;
  trackingCode: string;
  status: OrderStatus;
  currentCoord: {
    latitude: number;
    longitude: number;
  };
  heading: number;
  speedKmh: number;
  etaMinutes: number;
  waypoints: TrackingWaypoint[];
  deliveryPartner?: {
    name: string;
    phone: string;
    vehicleNumber: string;
    avatarUrl: string;
    rating: number;
  };
  isSimulated: boolean;
}

// ================= PAYMENTS =================
export interface CreatePaymentIntentRequest {
  idempotencyKey: string;
  orderId: string;
  amountInr: number;
  method: 'upi' | 'card' | 'netbanking' | 'cod';
}

export interface CreatePaymentIntentResponse {
  transactionId: string;
  orderId: string;
  amountInr: number;
  status: 'pending' | 'completed' | 'failed';
  gatewayRef?: string;
  upiPaymentLink?: string;
}

// ================= SUPPORT =================
export interface CreateSupportTicketRequest {
  orderId?: string;
  category: SupportTicketCategory;
  subject: string;
  message: string;
}


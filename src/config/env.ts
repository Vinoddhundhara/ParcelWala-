/**
 * ParcelGo Application Configuration & Environment Settings
 *
 * Clearly separates development-only mock services from future production API integration.
 */

export const ENV = {
  APP_NAME: 'ParcelGo',
  APP_VERSION: '1.0.0',
  APP_TAGLINE: 'Every parcel, on its way.',

  // Backend API URL - Change this when connecting to Node/Express backend.
  // Note: On physical Android devices, use computer LAN IP (e.g. http://192.168.1.50:4000)
  // or a tunneled ngrok/Cloudflare URL instead of 'localhost'.
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.parcelgo.dev/v1',

  // Development Flags
  IS_DEV_MODE: __DEV__,
  USE_MOCK_SERVICES: true, // Set to false when production backend is active
  DEV_TEST_OTP: '123456', // Clearly labeled development-only test OTP

  // Support Contacts
  SUPPORT_PHONE: '+91 80000 12345',
  SUPPORT_EMAIL: 'support@parcelgo.in',

  // Timers & Limits
  API_TIMEOUT_MS: 12000,
  OTP_RESEND_COOLDOWN_SEC: 30,
  SIMULATED_TRACKING_INTERVAL_MS: 3000,

  // Currency
  CURRENCY_SYMBOL: '₹',
  CURRENCY_CODE: 'INR',
};

export const API_ENDPOINTS = {
  // Auth
  REQUEST_OTP: '/auth/request-otp',
  VERIFY_OTP: '/auth/verify-otp',
  LOGOUT: '/auth/logout',

  // Customer Profile
  CUSTOMER_PROFILE: '/customer/profile',

  // Addresses
  ADDRESSES: '/addresses',
  ADDRESS_BY_ID: (id: string) => `/addresses/${id}`,

  // Orders & Pricing
  QUOTE: '/orders/quote',
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,

  // Tracking
  TRACKING: (id: string) => `/orders/${id}/tracking`,

  // Payments
  CREATE_PAYMENT: '/payments/create',
  PAYMENT_BY_ID: (id: string) => `/payments/${id}`,

  // Support
  SUPPORT_TICKETS: '/support/tickets',
};


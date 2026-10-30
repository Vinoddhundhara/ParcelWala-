/**
 * ParcelGo Core Domain Types
 */

export type UserProfile = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
  isPhoneVerified: boolean;
};

export type AddressLabel = 'Home' | 'Work' | 'Other';

export type Address = {
  id: string;
  label: AddressLabel;
  customLabel?: string;
  contactName: string;
  contactPhone: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  instructions?: string;
  isDefault?: boolean;
};

export type ParcelCategory = 'documents' | 'small' | 'medium' | 'large' | 'fragile';

export type VehicleType = 'bike' | 'auto_cargo' | 'mini_truck';

export interface VehicleOption {
  id: VehicleType;
  title: string;
  subtitle: string;
  capacityKg: number;
  etaMultiplier: number;
  baseCharge: number;
  iconName: string;
  badge?: string;
}

export interface ParcelCategoryConfig {
  id: ParcelCategory;
  name: string;
  description: string;
  maxWeightKg: number;
  dimensionsCm: string;
  iconName: string;
  baseCharge: number;
}

export type ParcelDetails = {
  category: ParcelCategory;
  description: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  declaredValueInr?: number;
  photoUri?: string;
  specialInstructions?: string;
  fragileHandling?: boolean;
};

export type ServiceType = 'standard' | 'express' | 'scheduled';

export type DeliverySchedule = {
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "02:00 PM - 04:00 PM"
};

export type FareBreakdown = {
  baseFare: number;
  distanceKm: number;
  distanceCharge: number;
  weightKg: number;
  weightSurcharge: number;
  sizeSurcharge: number;
  vehicleType?: VehicleType;
  vehicleSurcharge?: number;
  serviceType: ServiceType;
  serviceSurcharge: number;
  insuranceOptIn?: boolean;
  insuranceFeeInr?: number;
  tipAmountInr?: number;
  platformFee: number;
  taxGst: number;
  discount: number;
  couponCode?: string;
  totalInr: number;
  estimatedMinutes: number;
  isDevEstimatedDistance?: boolean;
};

export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'cod';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type PaymentDetails = {
  method: PaymentMethodType;
  status: PaymentStatus;
  transactionId?: string;
  upiId?: string;
  paidAt?: string;
  errorMessage?: string;
};

export type OrderStatus =
  | 'created'
  | 'driver_assigned'
  | 'arriving_pickup'
  | 'pickup_complete'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type DeliveryPartner = {
  id: string;
  name: string;
  phone: string;
  rating: number;
  totalDeliveries: number;
  vehicleNumber: string;
  vehicleType: string;
  avatarUrl: string;
  currentLatitude?: number;
  currentLongitude?: number;
};

export type OrderTimelineEvent = {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
};

export type Order = {
  id: string;
  trackingCode: string; // e.g. "PG-849201"
  status: OrderStatus;
  pickupAddress: Address;
  dropAddress: Address;
  parcel: ParcelDetails;
  serviceType: ServiceType;
  vehicleType: VehicleType;
  pickupOtp: string; // 4-digit OTP given to courier partner at pickup (e.g. "8738")
  deliveryOtp: string; // 4-digit OTP given to courier partner at drop delivery (e.g. "4912")
  schedule?: DeliverySchedule;
  fareBreakdown: FareBreakdown;
  payment: PaymentDetails;
  deliveryPartner?: DeliveryPartner;
  timeline: OrderTimelineEvent[];
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
  cancelledAt?: string;
  isSimulated?: boolean;
};

export type TrackingWaypoint = {
  latitude: number;
  longitude: number;
  status: OrderStatus;
  label: string;
  etaMinutes: number;
};

export type TrackingState = {
  orderId: string;
  currentWaypointIndex: number;
  totalWaypoints: number;
  currentCoord: { latitude: number; longitude: number };
  heading: number;
  status: OrderStatus;
  isSimulated: boolean;
  isPlaying: boolean;
  etaMinutes: number;
  speedKmh: number;
  pickupOtp: string;
  deliveryOtp: string;
};

export type SupportTicketCategory =
  | 'late_delivery'
  | 'damaged_parcel'
  | 'wrong_address'
  | 'driver_issue'
  | 'billing_refund'
  | 'other';

export type SupportTicket = {
  id: string;
  orderId?: string;
  category: SupportTicketCategory;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
};

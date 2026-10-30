import { create } from 'zustand';
import {
  Address,
  DeliverySchedule,
  FareBreakdown,
  ParcelCategory,
  ParcelDetails,
  ServiceType,
  VehicleType,
} from '../types';
import {
  estimateHaversineRoadDistanceKm,
  fareCalculator,
} from '../services/pricing/fareCalculator';
import { PARCEL_LIMITS } from '../utils/validation';

export const INITIAL_PARCEL: ParcelDetails = {
  category: 'small',
  description: '',
  weightKg: 1.5,
  lengthCm: 25,
  widthCm: 20,
  heightCm: 15,
  declaredValueInr: 1000,
  specialInstructions: '',
  fragileHandling: false,
};

interface BookingState {
  pickupAddress: Address | null;
  dropAddress: Address | null;
  parcel: ParcelDetails;
  serviceType: ServiceType;
  vehicleType: VehicleType;
  insuranceOptIn: boolean;
  tipAmountInr: number;
  schedule?: DeliverySchedule;
  couponCode?: string;
  quote: FareBreakdown | null;
  idempotencyKey: string;
  isCalculatingQuote: boolean;
  quoteError: string | null;

  setPickupAddress: (address: Address) => void;
  setDropAddress: (address: Address) => void;
  setParcelDetails: (details: Partial<ParcelDetails>) => void;
  setCategory: (category: ParcelCategory) => void;
  setServiceType: (service: ServiceType) => void;
  setVehicleType: (vehicle: VehicleType) => void;
  setInsuranceOptIn: (optIn: boolean) => void;
  setTipAmount: (amount: number) => void;
  setSchedule: (schedule?: DeliverySchedule) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  recalculateQuote: () => void;
  resetBooking: () => void;
}

const generateIdempotencyKey = () => `pg_idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const useBookingStore = create<BookingState>((set, get) => ({
  pickupAddress: null,
  dropAddress: null,
  parcel: INITIAL_PARCEL,
  serviceType: 'standard',
  vehicleType: 'bike',
  insuranceOptIn: false,
  tipAmountInr: 0,
  schedule: undefined,
  couponCode: undefined,
  quote: null,
  idempotencyKey: generateIdempotencyKey(),
  isCalculatingQuote: false,
  quoteError: null,

  setPickupAddress: (address: Address) => {
    set({ pickupAddress: address });
    get().recalculateQuote();
  },

  setDropAddress: (address: Address) => {
    set({ dropAddress: address });
    get().recalculateQuote();
  },

  setParcelDetails: (details: Partial<ParcelDetails>) => {
    const updated = { ...get().parcel, ...details };
    set({ parcel: updated });
    get().recalculateQuote();
  },

  setCategory: (category: ParcelCategory) => {
    const limits = PARCEL_LIMITS[category];
    const current = get().parcel;
    const safeWeight = Math.min(current.weightKg, limits.maxWeightKg);
    const updated: ParcelDetails = {
      ...current,
      category,
      weightKg: safeWeight > 0 ? safeWeight : 1,
      fragileHandling: category === 'fragile',
    };
    set({ parcel: updated });
    get().recalculateQuote();
  },

  setServiceType: (service: ServiceType) => {
    set({ serviceType: service });
    get().recalculateQuote();
  },

  setVehicleType: (vehicle: VehicleType) => {
    set({ vehicleType: vehicle });
    get().recalculateQuote();
  },

  setInsuranceOptIn: (optIn: boolean) => {
    set({ insuranceOptIn: optIn });
    get().recalculateQuote();
  },

  setTipAmount: (amount: number) => {
    set({ tipAmountInr: amount });
    get().recalculateQuote();
  },

  setSchedule: (schedule?: DeliverySchedule) => {
    set({ schedule });
  },

  applyCoupon: (code: string) => {
    const clean = code.trim().toUpperCase();
    set({ couponCode: clean });
    get().recalculateQuote();
    const currentQuote = get().quote;
    return !!(currentQuote && currentQuote.discount > 0);
  },

  removeCoupon: () => {
    set({ couponCode: undefined });
    get().recalculateQuote();
  },

  recalculateQuote: () => {
    const {
      pickupAddress,
      dropAddress,
      parcel,
      serviceType,
      vehicleType,
      insuranceOptIn,
      tipAmountInr,
      couponCode,
    } = get();

    if (!pickupAddress || !dropAddress) {
      set({ quote: null, quoteError: null });
      return;
    }

    try {
      const distanceKm = estimateHaversineRoadDistanceKm(
        pickupAddress.latitude,
        pickupAddress.longitude,
        dropAddress.latitude,
        dropAddress.longitude
      );

      const quote = fareCalculator.calculateQuote({
        distanceKm,
        parcel,
        serviceType,
        vehicleType,
        insuranceOptIn,
        tipAmountInr,
        couponCode,
        isDevEstimatedDistance: true,
      });

      set({ quote, quoteError: null });
    } catch (err: unknown) {
      set({ quote: null, quoteError: (err as Error)?.message || 'Calculation error' });
    }
  },

  resetBooking: () => {
    set({
      pickupAddress: null,
      dropAddress: null,
      parcel: INITIAL_PARCEL,
      serviceType: 'standard',
      vehicleType: 'bike',
      insuranceOptIn: false,
      tipAmountInr: 0,
      schedule: undefined,
      couponCode: undefined,
      quote: null,
      idempotencyKey: generateIdempotencyKey(),
      quoteError: null,
    });
  },
}));

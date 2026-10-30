import {
  FareBreakdown,
  ParcelCategory,
  ParcelDetails,
  ServiceType,
  VehicleType,
} from '../../types';

export interface PricingConfig {
  baseFare: number; // e.g. ₹30
  distanceRatePerKm: number; // e.g. ₹8 / km
  minimumFare: number; // e.g. ₹40
  platformFee: number; // e.g. ₹5
  gstTaxRate: number; // 0.18 (18%)
  insuranceFee: number; // ₹15 transit protection up to ₹10,000

  // Free base allowances
  freeWeightAllowanceKg: number; // 1 kg included
  ratePerExcessWeightKg: number; // ₹12 per kg above allowance

  // Volumetric factor divisor (length * width * height / 5000)
  volumetricDivisor: number; // 5000
  ratePerExcessVolumetricKg: number; // ₹10

  // Category specific surcharges
  categorySurcharge: Record<ParcelCategory, number>;

  // Vehicle type specific surcharges
  vehicleSurcharge: Record<VehicleType, number>;

  // Service options surcharges
  serviceSurcharge: Record<ServiceType, number>;
}

export const DEFAULT_DEV_PRICING_CONFIG: PricingConfig = {
  baseFare: 30, // ₹30 base
  distanceRatePerKm: 8, // ₹8 per km
  minimumFare: 40,
  platformFee: 5,
  gstTaxRate: 0.18, // 18% GST
  insuranceFee: 15,

  freeWeightAllowanceKg: 1,
  ratePerExcessWeightKg: 12,

  volumetricDivisor: 5000,
  ratePerExcessVolumetricKg: 10,

  categorySurcharge: {
    documents: 0,
    small: 10,
    medium: 25,
    large: 50,
    fragile: 40, // special handling fee
  },

  vehicleSurcharge: {
    bike: 0,
    auto_cargo: 40,
    mini_truck: 120,
  },

  serviceSurcharge: {
    standard: 0,
    express: 45, // direct priority courier dispatch
    scheduled: 15, // scheduled slot reservation
  },
};

export interface QuoteRequest {
  distanceKm: number;
  parcel: ParcelDetails;
  serviceType: ServiceType;
  vehicleType?: VehicleType;
  insuranceOptIn?: boolean;
  tipAmountInr?: number;
  couponCode?: string;
  isDevEstimatedDistance?: boolean;
}

export interface CouponDiscount {
  code: string;
  percentage?: number;
  flatAmount?: number;
  maxDiscount?: number;
  minOrderAmount?: number;
}

export const AVAILABLE_COUPONS: Record<string, CouponDiscount> = {
  PARCELGO50: {
    code: 'PARCELGO50',
    percentage: 50,
    maxDiscount: 50,
    minOrderAmount: 80,
  },
  FIRSTFREE: {
    code: 'FIRSTFREE',
    flatAmount: 30,
    minOrderAmount: 50,
  },
  EXPRESS10: {
    code: 'EXPRESS10',
    percentage: 10,
    maxDiscount: 100,
  },
};

export function estimateHaversineRoadDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0.5;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  const roadFactor = 1.25;
  const estimatedKm = straightLineKm * roadFactor;

  return Math.max(0.5, Math.round(estimatedKm * 10) / 10);
}

export class FareCalculatorService {
  private config: PricingConfig;

  constructor(config: PricingConfig = DEFAULT_DEV_PRICING_CONFIG) {
    this.config = config;
  }

  public calculateQuote(request: QuoteRequest): FareBreakdown {
    const {
      distanceKm,
      parcel,
      serviceType,
      vehicleType = 'bike',
      insuranceOptIn = false,
      tipAmountInr = 0,
      couponCode,
      isDevEstimatedDistance,
    } = request;

    if (distanceKm < 0 || isNaN(distanceKm)) {
      throw new Error('Distance must be a non-negative number');
    }
    if (parcel.weightKg <= 0 || isNaN(parcel.weightKg)) {
      throw new Error('Parcel weight must be greater than zero');
    }

    // 1. Base fare & Distance charge
    const baseFare = this.config.baseFare;
    const distanceCharge = Math.round(distanceKm * this.config.distanceRatePerKm);

    // 2. Weight Surcharge
    const excessWeight = Math.max(0, parcel.weightKg - this.config.freeWeightAllowanceKg);
    const weightSurcharge = Math.round(excessWeight * this.config.ratePerExcessWeightKg);

    // 3. Volumetric Size Surcharge
    const volumetricWeight =
      (parcel.lengthCm * parcel.widthCm * parcel.heightCm) / this.config.volumetricDivisor;
    const excessVolumetric = Math.max(0, volumetricWeight - parcel.weightKg);
    const sizeSurcharge =
      Math.round(excessVolumetric * this.config.ratePerExcessVolumetricKg) +
      (this.config.categorySurcharge[parcel.category] || 0) +
      (parcel.fragileHandling ? 20 : 0);

    // 4. Vehicle Type Surcharge
    const vehicleSurcharge = this.config.vehicleSurcharge[vehicleType] || 0;

    // 5. Service Type Surcharge
    const serviceSurcharge = this.config.serviceSurcharge[serviceType] || 0;

    // Subtotal before platform fee & tax
    let subtotal =
      baseFare +
      distanceCharge +
      weightSurcharge +
      sizeSurcharge +
      vehicleSurcharge +
      serviceSurcharge;
    subtotal = Math.max(subtotal, this.config.minimumFare);

    // 6. Discount calculation
    let discount = 0;
    if (couponCode && AVAILABLE_COUPONS[couponCode.toUpperCase()]) {
      const coupon = AVAILABLE_COUPONS[couponCode.toUpperCase()];
      if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
        if (coupon.flatAmount) {
          discount = coupon.flatAmount;
        } else if (coupon.percentage) {
          discount = (subtotal * coupon.percentage) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
        }
      }
    }
    discount = Math.min(discount, subtotal);
    discount = Math.round(discount);

    const discountedSubtotal = subtotal - discount;

    // 7. Platform fee
    const platformFee = this.config.platformFee;

    // 8. GST / Tax (18% on taxable service charges)
    const taxGst = Math.round((discountedSubtotal + platformFee) * this.config.gstTaxRate);

    // 9. Insurance Fee
    const insuranceFeeInr = insuranceOptIn ? this.config.insuranceFee : 0;

    // 10. Total
    const totalInr = discountedSubtotal + platformFee + taxGst + insuranceFeeInr + tipAmountInr;

    // 11. Estimated transit time (minutes)
    const speedFactorMinPerKm = serviceType === 'express' ? 2.5 : 3.5;
    const vehicleEtaMultiplier = vehicleType === 'mini_truck' ? 1.4 : vehicleType === 'auto_cargo' ? 1.2 : 1.0;
    const estimatedMinutes = Math.round((10 + distanceKm * speedFactorMinPerKm) * vehicleEtaMultiplier);

    return {
      baseFare,
      distanceKm: Math.round(distanceKm * 10) / 10,
      distanceCharge,
      weightKg: parcel.weightKg,
      weightSurcharge,
      sizeSurcharge,
      vehicleType,
      vehicleSurcharge,
      serviceType,
      serviceSurcharge,
      insuranceOptIn,
      insuranceFeeInr,
      tipAmountInr,
      platformFee,
      taxGst,
      discount,
      couponCode: discount > 0 ? couponCode?.toUpperCase() : undefined,
      totalInr,
      estimatedMinutes,
      isDevEstimatedDistance: !!isDevEstimatedDistance,
    };
  }
}

export const fareCalculator = new FareCalculatorService();

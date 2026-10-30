import {
  FareCalculatorService,
  DEFAULT_DEV_PRICING_CONFIG,
  estimateHaversineRoadDistanceKm,
} from '../services/pricing/fareCalculator';
import { ParcelDetails } from '../types';

describe('FareCalculatorService', () => {
  const calculator = new FareCalculatorService(DEFAULT_DEV_PRICING_CONFIG);

  const baseParcel: ParcelDetails = {
    category: 'small',
    description: 'Books',
    weightKg: 1, // Within 1kg free allowance
    lengthCm: 20,
    widthCm: 20,
    heightCm: 10, // Volumetric weight = (20*20*10)/5000 = 0.8kg <= 1kg
    declaredValueInr: 500,
  };

  it('calculates standard base fare + distance charge for 5 km', () => {
    const quote = calculator.calculateQuote({
      distanceKm: 5,
      parcel: baseParcel,
      serviceType: 'standard',
    });

    // baseFare: 30
    // distance: 5 * 8 = 40
    // weight surcharge: 0 (1kg)
    // size surcharge: 10 (small category)
    // service surcharge: 0
    // subtotal = 30 + 40 + 0 + 10 = 80
    // platformFee = 5
    // tax = Math.round((80 + 5) * 0.18) = Math.round(85 * 0.18) = 15
    // total = 85 + 15 = 100
    expect(quote.baseFare).toBe(30);
    expect(quote.distanceCharge).toBe(40);
    expect(quote.weightSurcharge).toBe(0);
    expect(quote.sizeSurcharge).toBe(10);
    expect(quote.platformFee).toBe(5);
    expect(quote.taxGst).toBe(15);
    expect(quote.totalInr).toBe(100);
  });

  it('enforces minimum fare for very short distances', () => {
    const quote = calculator.calculateQuote({
      distanceKm: 0.5,
      parcel: { ...baseParcel, category: 'documents' },
      serviceType: 'standard',
    });

    // baseFare: 30, distance: 0.5*8 = 4, size: 0 -> subtotal 34, minimum is 40!
    // subtotal after minFare = 40
    // platform fee = 5
    // tax = Math.round(45 * 0.18) = 8
    // total = 45 + 8 = 53
    expect(quote.totalInr).toBeGreaterThanOrEqual(53);
  });

  it('adds weight surcharge for excess weight', () => {
    const heavyParcel: ParcelDetails = {
      ...baseParcel,
      category: 'medium',
      weightKg: 4, // 3kg excess above 1kg free allowance -> 3 * 12 = 36
    };

    const quote = calculator.calculateQuote({
      distanceKm: 5,
      parcel: heavyParcel,
      serviceType: 'standard',
    });

    expect(quote.weightSurcharge).toBe(36);
  });

  it('applies express delivery surcharge', () => {
    const standardQuote = calculator.calculateQuote({
      distanceKm: 5,
      parcel: baseParcel,
      serviceType: 'standard',
    });

    const expressQuote = calculator.calculateQuote({
      distanceKm: 5,
      parcel: baseParcel,
      serviceType: 'express',
    });

    expect(expressQuote.serviceSurcharge).toBe(45);
    expect(expressQuote.totalInr).toBeGreaterThan(standardQuote.totalInr);
  });

  it('applies coupon code discount with max cap', () => {
    const quote = calculator.calculateQuote({
      distanceKm: 15,
      parcel: baseParcel,
      serviceType: 'standard',
      couponCode: 'PARCELGO50', // 50% up to ₹50
    });

    expect(quote.discount).toBe(50);
    expect(quote.couponCode).toBe('PARCELGO50');
  });

  it('throws error for invalid distance or weight inputs', () => {
    expect(() =>
      calculator.calculateQuote({
        distanceKm: -5,
        parcel: baseParcel,
        serviceType: 'standard',
      })
    ).toThrow('Distance must be a non-negative number');

    expect(() =>
      calculator.calculateQuote({
        distanceKm: 5,
        parcel: { ...baseParcel, weightKg: 0 },
        serviceType: 'standard',
      })
    ).toThrow('Parcel weight must be greater than zero');
  });

  it('estimates road distance from coordinates correctly', () => {
    // Connaught Place to Cyber City Gurgaon (~28 km straight line)
    const distance = estimateHaversineRoadDistanceKm(28.6315, 77.2167, 28.4986, 77.0878);
    expect(distance).toBeGreaterThan(15);
    expect(distance).toBeLessThan(45);
  });
});


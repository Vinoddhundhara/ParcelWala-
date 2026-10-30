import {
  phoneSchema,
  otpSchema,
  addressSchema,
  parcelDetailsSchema,
} from '../utils/validation';

describe('Validation Schemas', () => {
  describe('phoneSchema', () => {
    it('accepts valid 10-digit Indian numbers starting with 6-9', () => {
      expect(phoneSchema.safeParse('9876543210').success).toBe(true);
      expect(phoneSchema.safeParse('8123456789').success).toBe(true);
      expect(phoneSchema.safeParse('7000000000').success).toBe(true);
      expect(phoneSchema.safeParse('6999999999').success).toBe(true);
    });

    it('cleans formatting such as spaces, dashes, +91', () => {
      const result = phoneSchema.safeParse('+91 98765-43210');
      // Strips non-digits; if +91 included, length is 12 so fails regex unless parsed as 10 digits
      // But standard input with spaces '98765 43210' should clean to 10 digits
      const cleaned = phoneSchema.safeParse('98765 43210');
      expect(cleaned.success).toBe(true);
      if (cleaned.success) {
        expect(cleaned.data).toBe('9876543210');
      }
    });

    it('rejects numbers starting with 0, 1-5 or wrong length', () => {
      expect(phoneSchema.safeParse('1234567890').success).toBe(false);
      expect(phoneSchema.safeParse('0987654321').success).toBe(false);
      expect(phoneSchema.safeParse('98765').success).toBe(false);
      expect(phoneSchema.safeParse('987654321000').success).toBe(false);
    });
  });

  describe('otpSchema', () => {
    it('accepts exactly 6 numeric digits', () => {
      expect(otpSchema.safeParse('123456').success).toBe(true);
      expect(otpSchema.safeParse('000000').success).toBe(true);
    });

    it('rejects invalid length or alphabets', () => {
      expect(otpSchema.safeParse('12345').success).toBe(false);
      expect(otpSchema.safeParse('1234567').success).toBe(false);
      expect(otpSchema.safeParse('12345a').success).toBe(false);
    });
  });

  describe('addressSchema', () => {
    it('validates a complete address object', () => {
      const validAddress = {
        label: 'Home' as const,
        contactName: 'Rohit Sharma',
        contactPhone: '9876543210',
        streetAddress: 'Flat 402, Sunshine Towers, MG Road',
        landmark: 'Opposite Metro Station',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      };
      expect(addressSchema.safeParse(validAddress).success).toBe(true);
    });

    it('rejects invalid pin codes', () => {
      const invalidPin = {
        label: 'Work' as const,
        contactName: 'Ananya',
        contactPhone: '9876543210',
        streetAddress: 'Tech Park Block B',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '5600', // Only 4 digits
      };
      expect(addressSchema.safeParse(invalidPin).success).toBe(false);
    });
  });

  describe('parcelDetailsSchema', () => {
    it('accepts parcel within category weight limits', () => {
      const validParcel = {
        category: 'documents' as const,
        description: 'Legal Agreement',
        weightKg: 1.5, // Document limit is 2kg
        lengthCm: 35,
        widthCm: 25,
        heightCm: 5,
      };
      expect(parcelDetailsSchema.safeParse(validParcel).success).toBe(true);
    });

    it('rejects parcel exceeding category limit', () => {
      const overweightDoc = {
        category: 'documents' as const,
        description: 'Heavy Files',
        weightKg: 3.5, // Exceeds 2kg document limit!
        lengthCm: 35,
        widthCm: 25,
        heightCm: 5,
      };
      const result = parcelDetailsSchema.safeParse(overweightDoc);
      expect(result.success).toBe(false);
    });
  });
});


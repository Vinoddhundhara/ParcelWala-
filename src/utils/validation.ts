import { z } from 'zod';
import { ParcelCategory } from '../types';

export const phoneRegex = /^[6-9]\d{9}$/;

export const phoneSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => phoneRegex.test(val), {
    message: 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)',
  });

export const otpSchema = z
  .string()
  .trim()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d+$/, 'OTP must contain numbers only');

export const userProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  phone: phoneSchema,
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
});

export const addressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']),
  customLabel: z.string().trim().optional(),
  contactName: z.string().trim().min(2, 'Contact name is required'),
  contactPhone: phoneSchema,
  streetAddress: z.string().trim().min(5, 'Street address must be at least 5 characters'),
  landmark: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  instructions: z.string().trim().optional(),
});

export const PARCEL_LIMITS: Record<
  ParcelCategory,
  { maxWeightKg: number; maxLengthCm: number; maxWidthCm: number; maxHeightCm: number }
> = {
  documents: { maxWeightKg: 2, maxLengthCm: 40, maxWidthCm: 30, maxHeightCm: 10 },
  small: { maxWeightKg: 5, maxLengthCm: 30, maxWidthCm: 30, maxHeightCm: 30 },
  medium: { maxWeightKg: 15, maxLengthCm: 50, maxWidthCm: 50, maxHeightCm: 50 },
  large: { maxWeightKg: 30, maxLengthCm: 100, maxWidthCm: 80, maxHeightCm: 80 },
  fragile: { maxWeightKg: 10, maxLengthCm: 45, maxWidthCm: 45, maxHeightCm: 45 },
};

export const parcelDetailsSchema = z
  .object({
    category: z.enum(['documents', 'small', 'medium', 'large', 'fragile']),
    description: z.string().trim().min(3, 'Please describe parcel contents (e.g. Laptop, Clothes)'),
    weightKg: z
      .number()
      .positive('Weight must be greater than 0')
      .max(30, 'Maximum allowed weight is 30 kg'),
    lengthCm: z.number().positive('Length must be greater than 0').max(120, 'Max length 120 cm'),
    widthCm: z.number().positive('Width must be greater than 0').max(100, 'Max width 100 cm'),
    heightCm: z.number().positive('Height must be greater than 0').max(100, 'Max height 100 cm'),
    declaredValueInr: z.number().nonnegative().optional(),
    photoUri: z.string().optional(),
    specialInstructions: z.string().trim().optional(),
    fragileHandling: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const limits = PARCEL_LIMITS[data.category];
    if (limits && data.weightKg > limits.maxWeightKg) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['weightKg'],
        message: `Max weight for ${data.category} is ${limits.maxWeightKg} kg`,
      });
    }
  });

export const supportTicketSchema = z.object({
  category: z.enum([
    'late_delivery',
    'damaged_parcel',
    'wrong_address',
    'driver_issue',
    'billing_refund',
    'other',
  ]),
  subject: z.string().trim().min(4, 'Subject is required'),
  message: z.string().trim().min(10, 'Please provide more details (at least 10 characters)'),
});

export function getFirstZodError(error: unknown): string {
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues: Array<{ message: string }> }).issues;
    if (issues && issues.length > 0) {
      return issues[0].message;
    }
  }
  return 'Validation failed. Please check inputs.';
}

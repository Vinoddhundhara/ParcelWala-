export const colors = {
  // Brand Primary (Vibrant Electric Orange)
  primary: '#FF5E00',
  primaryHover: '#E05200',
  primarySoft: '#FFF3EB',
  primaryMuted: '#FFE3D1',
  primaryDark: '#B83E00',

  // Semantic
  success: '#10B981',
  successSoft: '#ECFDF5',
  successDark: '#047857',

  info: '#4F46E5',
  infoSoft: '#EEF2FF',
  infoDark: '#3730A3',

  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  warningDark: '#B45309',

  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  dangerDark: '#B91C1C',

  // Neutrals / Surfaces
  background: '#F8F9FB',
  backgroundAlt: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F3F4F6',
  surfaceBorder: '#E5E7EB',
  surfaceBorderLight: '#F0F2F5',

  // Deep Charcoal Typography
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textLight: '#FFFFFF',
  textBrand: '#FF5E00',

  // Gradients
  gradientPrimary: ['#FF6B00', '#FF3D00'] as const,
  gradientDark: ['#1F2937', '#111827'] as const,
  gradientSuccess: ['#10B981', '#059669'] as const,
  gradientSoftOrange: ['#FFF8F5', '#FFEADB'] as const,
  gradientTracking: ['#3B82F6', '#1D4ED8'] as const,

  // Status Colors for Orders
  status: {
    created: '#F59E0B',
    driver_assigned: '#6366F1',
    arriving_pickup: '#8B5CF6',
    pickup_complete: '#06B6D4',
    in_transit: '#3B82F6',
    out_for_delivery: '#EC4899',
    delivered: '#10B981',
    cancelled: '#EF4444',
  },
};

export type ColorsType = typeof colors;


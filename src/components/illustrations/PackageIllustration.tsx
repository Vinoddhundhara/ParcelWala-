import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  LinearGradient,
  Stop,
  Defs,
} from 'react-native-svg';
import { ParcelCategory } from '../../types';
import { colors } from '../../theme';

export interface PackageIllustrationProps {
  category: ParcelCategory;
  size?: number;
  style?: ViewStyle;
}

export const PackageIllustration: React.FC<PackageIllustrationProps> = ({
  category,
  size = 100,
  style,
}) => {
  const renderSvgContent = () => {
    switch (category) {
      case 'documents':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <Defs>
              <LinearGradient id="docGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <Stop stopColor="#FFF2E8" />
                <Stop stopColor="#FFE0CC" />
              </LinearGradient>
              <LinearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop stopColor="#FF7A1A" />
                <Stop stopColor="#FF5E00" />
              </LinearGradient>
            </Defs>
            {/* Background folder */}
            <Rect x="20" y="24" width="60" height="56" rx="8" fill="url(#docGrad)" stroke="#FFA366" strokeWidth="2" />
            <Path d="M20 32 L50 32 L56 38 L80 38" stroke="#FF5E00" strokeWidth="2" fill="none" />
            {/* Document sheet */}
            <Rect x="28" y="16" width="44" height="52" rx="4" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
            {/* Text lines on sheet */}
            <Path d="M34 26 L56 26" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M34 34 L64 34" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
            <Path d="M34 42 L60 42" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
            <Path d="M34 50 L48 50" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
            {/* Verification badge stamp */}
            <Circle cx="62" cy="56" r="10" fill="url(#badgeGrad)" />
            <Path d="M58 56 L61 59 L67 53" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case 'fragile':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <Defs>
              <LinearGradient id="fragileBox" x1="0" y1="0" x2="100" y2="100">
                <Stop stopColor="#FEF3C7" />
                <Stop stopColor="#FDE68A" />
              </LinearGradient>
            </Defs>
            {/* Isometric Glass Container */}
            <Rect x="22" y="22" width="56" height="58" rx="10" fill="url(#fragileBox)" stroke="#F59E0B" strokeWidth="2" />
            {/* Wine Glass / Fragile Icon */}
            <Path
              d="M42 34 Q50 34 50 44 L50 56 L44 56 L56 56 L50 56 L50 44 Q50 34 58 34 Z"
              fill="#EF4444"
              opacity="0.85"
            />
            {/* Handle with care tape */}
            <Rect x="16" y="60" width="68" height="12" rx="2" fill="#EF4444" transform="rotate(-6 50 66)" />
            <Path d="M22 66 L28 66 M34 66 L42 66 M48 66 L56 66 M62 66 L70 66 M76 66 L82 66" stroke="#FFFFFF" strokeWidth="2" />
          </Svg>
        );

      case 'large':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <Defs>
              <LinearGradient id="cargoGrad" x1="0" y1="0" x2="100" y2="100">
                <Stop stopColor="#E2E8F0" />
                <Stop stopColor="#CBD5E1" />
              </LinearGradient>
            </Defs>
            {/* Heavy crate */}
            <Rect x="14" y="26" width="72" height="54" rx="6" fill="url(#cargoGrad)" stroke="#64748B" strokeWidth="2" />
            {/* Cross reinforcement beams */}
            <Path d="M14 26 L86 80 M86 26 L14 80" stroke="#94A3B8" strokeWidth="3" />
            {/* Heavy orange strap */}
            <Rect x="36" y="26" width="10" height="54" fill="#FF5E00" />
            <Rect x="60" y="26" width="10" height="54" fill="#FF5E00" />
            {/* Forklift indicator dots */}
            <Circle cx="24" cy="74" r="3" fill="#475569" />
            <Circle cx="80" cy="74" r="3" fill="#475569" />
          </Svg>
        );

      case 'medium':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <Defs>
              <LinearGradient id="boxGradMed" x1="20" y1="20" x2="80" y2="80">
                <Stop stopColor="#FED7AA" />
                <Stop stopColor="#FDBA74" />
              </LinearGradient>
            </Defs>
            {/* Box isometric top */}
            <Path d="M50 16 L80 30 L50 44 L20 30 Z" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.5" />
            {/* Left face */}
            <Path d="M20 30 L50 44 L50 78 L20 64 Z" fill="#FB923C" stroke="#EA580C" strokeWidth="1.5" />
            {/* Right face */}
            <Path d="M50 44 L80 30 L80 64 L50 78 Z" fill="#F97316" stroke="#EA580C" strokeWidth="1.5" />
            {/* Sealing tape */}
            <Path d="M46 18 L46 44 L46 76" stroke="#FF5E00" strokeWidth="5" />
            <Path d="M20 30 L50 44 L80 30" stroke="#FFEDD5" strokeWidth="2" />
          </Svg>
        );

      case 'small':
      default:
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <Defs>
              <LinearGradient id="boxGrad" x1="0" y1="0" x2="100" y2="100">
                <Stop stopColor="#FFEDD5" />
                <Stop stopColor="#FED7AA" />
              </LinearGradient>
            </Defs>
            {/* Playful compact box */}
            <Rect x="20" y="25" width="60" height="52" rx="8" fill="url(#boxGrad)" stroke="#F97316" strokeWidth="2" />
            {/* Electric orange brand label tape */}
            <Rect x="42" y="25" width="16" height="52" fill="#FF5E00" />
            {/* Shipping barcode symbol */}
            <Rect x="26" y="35" width="12" height="18" rx="2" fill="#FFFFFF" />
            <Path d="M28 38 L28 50 M31 38 L31 50 M34 38 L34 50" stroke="#1E293B" strokeWidth="1.5" />
            {/* Smile logo accent */}
            <Path d="M62 42 Q68 48 74 42" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          </Svg>
        );
    }
  };

  return <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>{renderSvgContent()}</View>;
};


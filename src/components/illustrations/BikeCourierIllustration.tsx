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
  Ellipse,
} from 'react-native-svg';
import { colors } from '../../theme';

export interface BikeCourierIllustrationProps {
  size?: number;
  color?: string;
  showMotionLines?: boolean;
  style?: ViewStyle;
}

export const BikeCourierIllustration: React.FC<BikeCourierIllustrationProps> = ({
  size = 120,
  color = colors.primary,
  showMotionLines = true,
  style,
}) => {
  const width = size;
  const height = (size * 80) / 100;

  return (
    <View style={[{ width, height, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={width} height={height} viewBox="0 0 160 120" fill="none">
        <Defs>
          {/* Brand Primary Gradient */}
          <LinearGradient id="bikePrimary" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FF7A1A" />
            <Stop offset="100%" stopColor="#FF4500" />
          </LinearGradient>

          {/* Delivery Box Gradient */}
          <LinearGradient id="boxGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FF944D" />
            <Stop offset="100%" stopColor="#E04800" />
          </LinearGradient>

          {/* Helmet Gradient */}
          <LinearGradient id="helmetGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>

          {/* Wheel Metallic Gradient */}
          <LinearGradient id="wheelRim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#475569" />
            <Stop offset="100%" stopColor="#1E293B" />
          </LinearGradient>

          {/* Headlight Beam Glow */}
          <LinearGradient id="headlightBeam" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Ground Shadow */}
        <Ellipse cx="80" cy="110" rx="60" ry="6" fill="#000000" opacity="0.12" />

        {/* Headlight Light Cone */}
        <Path d="M128 68 L160 52 L160 84 Z" fill="url(#headlightBeam)" />

        {/* Motion Speed Lines (behind bike) */}
        {showMotionLines && (
          <G opacity="0.75">
            <Path d="M6 72 L26 72" stroke="#FF5E00" strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M2 82 L18 82" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
            <Path d="M10 92 L30 92" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M16 60 L32 60" stroke="#FF944D" strokeWidth="2" strokeLinecap="round" />
          </G>
        )}

        {/* Rear Wheel */}
        <G>
          <Circle cx="44" cy="94" r="18" fill="url(#wheelRim)" />
          <Circle cx="44" cy="94" r="12" fill="#F8FAFC" />
          <Circle cx="44" cy="94" r="6" fill="#0F172A" />
          {/* Spokes */}
          <Path d="M44 82 L44 106 M32 94 L56 94" stroke="#94A3B8" strokeWidth="1.5" />
        </G>

        {/* Front Wheel */}
        <G>
          <Circle cx="120" cy="94" r="18" fill="url(#wheelRim)" />
          <Circle cx="120" cy="94" r="12" fill="#F8FAFC" />
          <Circle cx="120" cy="94" r="6" fill="#0F172A" />
          {/* Spokes */}
          <Path d="M120 82 L120 106 M108 94 L132 94" stroke="#94A3B8" strokeWidth="1.5" />
        </G>

        {/* Chassis Frame & Exhaust */}
        <Path
          d="M44 94 L68 94 L90 82 L112 82 L120 94"
          stroke="#334155"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Exhaust pipe */}
        <Path d="M52 98 L30 102" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

        {/* Scooter Body Fairing */}
        <Path
          d="M56 86 L80 86 L104 68 L118 68 L124 76 L112 86 L74 88 Z"
          fill="url(#bikePrimary)"
        />

        {/* Handlebar & Windshield */}
        <Path d="M112 68 L118 52 L126 50" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
        <Path d="M120 52 L124 42" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Headlight fixture */}
        <Circle cx="126" cy="68" r="4.5" fill="#FEF08A" stroke="#E2E8F0" strokeWidth="1" />

        {/* Parcel Delivery Box on Rear Rack (Blinkit / Zepto / Porter style) */}
        <G>
          {/* Carrier Rack Support */}
          <Path d="M40 88 L34 66 L58 66" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          {/* Box Main */}
          <Rect
            x="24"
            y="42"
            width="34"
            height="32"
            rx="5"
            fill="url(#boxGrad)"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          {/* Box Straps */}
          <Rect x="30" y="42" width="4" height="32" fill="#B43403" />
          <Rect x="48" y="42" width="4" height="32" fill="#B43403" />
          {/* ParcelGo 'P' emblem on box */}
          <Rect x="37" y="52" width="10" height="11" rx="2" fill="#FFFFFF" />
          <Path d="M40 54 L44 54 Q46 54 46 57.5 Q46 61 44 61 L40 61 Z M40 61 L40 64" stroke="#FF5E00" strokeWidth="1.5" fill="none" />
          {/* Safety Reflector tape on box */}
          <Rect x="26" y="70" width="30" height="2" fill="#FEF08A" />
        </G>

        {/* Rider Body & Torso */}
        <G>
          {/* Seat */}
          <Path d="M58 78 Q74 76 86 82" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          {/* Torso in high-vis jacket */}
          <Path
            d="M68 76 L82 56 L96 64 L86 80 Z"
            fill="#1E293B"
          />
          {/* High-vis safety vest stripe */}
          <Path d="M76 66 L88 74" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" />
          {/* Arms reaching to handlebar */}
          <Path d="M86 60 L108 58 L118 52" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />

          {/* Rider Helmet */}
          <Circle cx="88" cy="42" r="11" fill="url(#helmetGrad)" />
          {/* Helmet Visor */}
          <Path
            d="M93 39 Q98 42 98 46 L91 46 Q90 41 93 39 Z"
            fill="#38BDF8"
          />
        </G>
      </Svg>
    </View>
  );
};


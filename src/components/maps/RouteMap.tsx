import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  ShieldCheck,
  Compass,
} from 'lucide-react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { Order, TrackingState } from '../../types';

export interface RouteMapProps {
  order: Order;
  trackingState?: TrackingState | null;
  height?: number;
  showOtpPill?: boolean;
  style?: ViewStyle;
  onResetSimulation?: () => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  order,
  trackingState,
  height = 290,
  showOtpPill = true,
  style,
  onResetSimulation,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const pLat = order.pickupAddress.latitude;
  const pLon = order.pickupAddress.longitude;
  const dLat = order.dropAddress.latitude;
  const dLon = order.dropAddress.longitude;

  // Courier coordinates
  const cLat = trackingState?.currentCoord.latitude ?? (pLat + 0.002);
  const cLon = trackingState?.currentCoord.longitude ?? (pLon + 0.001);

  const mapWidth = 360;
  const mapHeight = height;

  const minLat = Math.min(pLat, dLat) - 0.01;
  const maxLat = Math.max(pLat, dLat) + 0.01;
  const minLon = Math.min(pLon, dLon) - 0.01;
  const maxLon = Math.max(pLon, dLon) + 0.01;

  const toX = (lon: number) => {
    const norm = (lon - minLon) / (maxLon - minLon || 0.02);
    const centerShift = (norm - 0.5) * zoomLevel + 0.5;
    return Math.max(34, Math.min(mapWidth - 34, centerShift * mapWidth));
  };

  const toY = (lat: number) => {
    const norm = (maxLat - lat) / (maxLat - minLat || 0.02);
    const centerShift = (norm - 0.5) * zoomLevel + 0.5;
    return Math.max(34, Math.min(mapHeight - 34, centerShift * mapHeight));
  };

  const pickupX = toX(pLon);
  const pickupY = toY(pLat);
  const dropX = toX(dLon);
  const dropY = toY(dLat);
  const courierX = toX(cLon);
  const courierY = toY(cLat);

  // Intermediate curve control points
  const midX = pickupX + (dropX - pickupX) * 0.45 + 32;
  const midY = pickupY + (dropY - pickupY) * 0.55 - 24;

  // Calculate dynamic heading angle if not provided
  let riderAngle = trackingState?.heading ?? 0;
  if (!riderAngle) {
    const dx = dropX - courierX;
    const dy = dropY - courierY;
    riderAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  }

  // Active OTP to display (pickup OTP during early stages, delivery OTP during transit)
  const currentStatus = trackingState?.status || order.status;
  const isBeforePickup = ['created', 'driver_assigned', 'arriving_pickup'].includes(currentStatus);
  const activeOtp = isBeforePickup ? (order.pickupOtp || '8738') : (order.deliveryOtp || '4912');
  const otpLabel = isBeforePickup ? 'PICKUP OTP' : 'DELIVERY OTP';

  return (
    <View style={[styles.container, { height }, style]}>
      {/* SVG Vector Map Surface */}
      <Svg width="100%" height={height} viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
        <Defs>
          {/* Dark Slate Map Surface */}
          <LinearGradient id="mapBgGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1B2431" />
            <Stop offset="100%" stopColor="#111827" />
          </LinearGradient>

          {/* Active Route Gradient */}
          <LinearGradient id="activeRouteGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FF7A1A" />
            <Stop offset="50%" stopColor="#FF5E00" />
            <Stop offset="100%" stopColor="#10B981" />
          </LinearGradient>

          {/* Completed Trail Glow */}
          <LinearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#0284C7" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {/* Map Background Base */}
        <Rect width={mapWidth} height={mapHeight} fill="url(#mapBgGrad)" />

        {/* City Blocks & Road Geometry */}
        <G opacity={0.22}>
          {/* Main Avenues (Horizontal) */}
          <Line x1="0" y1="45" x2={mapWidth} y2="45" stroke="#475569" strokeWidth="2.5" />
          <Line x1="0" y1="105" x2={mapWidth} y2="105" stroke="#64748B" strokeWidth="3" />
          <Line x1="0" y1="175" x2={mapWidth} y2="175" stroke="#475569" strokeWidth="2.5" />
          <Line x1="0" y1="245" x2={mapWidth} y2="245" stroke="#334155" strokeWidth="2" />

          {/* Cross Boulevards (Vertical) */}
          <Line x1="50" y1="0" x2="50" y2={mapHeight} stroke="#334155" strokeWidth="2" />
          <Line x1="130" y1="0" x2="130" y2={mapHeight} stroke="#64748B" strokeWidth="3.5" />
          <Line x1="215" y1="0" x2="215" y2={mapHeight} stroke="#475569" strokeWidth="2" />
          <Line x1="295" y1="0" x2="295" y2={mapHeight} stroke="#64748B" strokeWidth="3" />

          {/* Secondary Alley Connectors */}
          <Line x1="130" y1="70" x2="215" y2="70" stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />
          <Line x1="50" y1="140" x2="130" y2="140" stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />
          <Line x1="215" y1="210" x2="295" y2="210" stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />

          {/* Urban Building Footprints */}
          <Rect x="60" y="55" width="60" height="40" rx="3" fill="#334155" opacity="0.6" />
          <Rect x="140" y="115" width="65" height="50" rx="4" fill="#334155" opacity="0.6" />
          <Rect x="225" y="55" width="60" height="40" rx="3" fill="#334155" opacity="0.6" />
          <Rect x="60" y="185" width="60" height="50" rx="4" fill="#334155" opacity="0.5" />
          <Rect x="225" y="185" width="60" height="50" rx="4" fill="#334155" opacity="0.5" />

          {/* District Identifiers */}
          <SvgText x="62" y="38" fill="#94A3B8" fontSize="9" fontWeight="700">
            NORTH BUSINESS HUB
          </SvgText>
          <SvgText x="142" y="98" fill="#94A3B8" fontSize="9" fontWeight="700">
            METRO EXPRESSWAY
          </SvgText>
          <SvgText x="226" y="238" fill="#94A3B8" fontSize="9" fontWeight="700">
            RESIDENTIAL SECTOR 9
          </SvgText>
        </G>

        {/* Route Shadow glow */}
        <Path
          d={`M${pickupX} ${pickupY} Q ${midX} ${midY} ${dropX} ${dropY}`}
          stroke="#FF5E00"
          strokeWidth="8"
          strokeLinecap="round"
          opacity={0.25}
          fill="none"
        />

        {/* Planned Route Line with Animated Dashing */}
        <Path
          d={`M${pickupX} ${pickupY} Q ${midX} ${midY} ${dropX} ${dropY}`}
          stroke="url(#activeRouteGrad)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray="8,5"
          fill="none"
        />

        {/* Completed Rider Breadcrumb Trail */}
        <Path
          d={`M${pickupX} ${pickupY} Q ${(pickupX + courierX) / 2 + 10} ${(pickupY + courierY) / 2} ${courierX} ${courierY}`}
          stroke="#38BDF8"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />

        {/* Pickup Pin Marker */}
        <G>
          <Circle cx={pickupX} cy={pickupY} r="16" fill="#10B981" opacity={0.2} />
          <Circle cx={pickupX} cy={pickupY} r="9" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
          <Circle cx={pickupX} cy={pickupY} r="3" fill="#FFFFFF" />
          {/* Pickup Label */}
          <Rect x={pickupX - 22} y={pickupY - 26} width="44" height="15" rx="4" fill="#10B981" />
          <SvgText x={pickupX} y={pickupY - 16} fill="#FFFFFF" fontSize="8" fontWeight="800" textAnchor="middle">
            PICKUP
          </SvgText>
        </G>

        {/* Drop Destination Pin Marker */}
        <G>
          <Circle cx={dropX} cy={dropY} r="18" fill="#FF5E00" opacity={0.2} />
          <Circle cx={dropX} cy={dropY} r="10" fill="#FF5E00" stroke="#FFFFFF" strokeWidth="2.5" />
          <Circle cx={dropX} cy={dropY} r="3.5" fill="#FFFFFF" />
          {/* Drop Label */}
          <Rect x={dropX - 20} y={dropY - 28} width="40" height="15" rx="4" fill="#FF5E00" />
          <SvgText x={dropX} y={dropY - 18} fill="#FFFFFF" fontSize="8" fontWeight="800" textAnchor="middle">
            DROP
          </SvgText>
        </G>

        {/* CUSTOM BIKE RIDER LIVE MARKER (Rotates matching trajectory) */}
        <G transform={`rotate(${riderAngle}, ${courierX}, ${courierY})`}>
          {/* Radar Ripple Pulses */}
          <Circle cx={courierX} cy={courierY} r="26" fill="#3B82F6" opacity={0.12} />
          <Circle cx={courierX} cy={courierY} r="18" fill="#38BDF8" opacity={0.25} />

          {/* Directional Headlight Cone */}
          <Path
            d={`M${courierX - 6} ${courierY - 10} L${courierX - 16} ${courierY - 38} L${courierX + 16} ${courierY - 38} L${courierX + 6} ${courierY - 10} Z`}
            fill="#FEF08A"
            opacity={0.35}
          />

          {/* Bike Body (Top-down motorcycle silhouette) */}
          {/* Rear Delivery Cargo Box */}
          <Rect
            x={courierX - 8}
            y={courierY + 4}
            width="16"
            height="14"
            rx="3"
            fill="#FF5E00"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          {/* Box Straps */}
          <Line x1={courierX - 8} y1={courierY + 9} x2={courierX + 8} y2={courierY + 9} stroke="#B43403" strokeWidth="1.5" />

          {/* Motorcycle Frame & Seat */}
          <Rect
            x={courierX - 4}
            y={courierY - 6}
            width="8"
            height="11"
            rx="3"
            fill="#1E293B"
          />

          {/* Rider Helmet (Top-down sphere with visor) */}
          <Circle cx={courierX} cy={courierY - 1} r="5.5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />
          {/* Visor */}
          <Path
            d={`M${courierX - 3.5} ${courierY - 4} Q${courierX} ${courierY - 6} ${courierX + 3.5} ${courierY - 4}`}
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Handlebar & Side Mirrors */}
          <Line x1={courierX - 10} y1={courierY - 9} x2={courierX + 10} y2={courierY - 9} stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
          <Circle cx={courierX - 10} cy={courierY - 9} r="1.5" fill="#E2E8F0" />
          <Circle cx={courierX + 10} cy={courierY - 9} r="1.5" fill="#E2E8F0" />

          {/* Front Wheel & Mudguard */}
          <Rect
            x={courierX - 2.5}
            y={courierY - 15}
            width="5"
            height="7"
            rx="2"
            fill="#0F172A"
          />
          {/* Headlamp bulb */}
          <Circle cx={courierX} cy={courierY - 12} r="2" fill="#FEF08A" />
        </G>
      </Svg>

      {/* Floating Header HUD: Live Simulation status & OTP Pill */}
      <View style={styles.topHudRow}>
        <View style={styles.livePill}>
          <View style={styles.livePulseDot} />
          <Text style={[styles.livePillText, typography.micro]}>LIVE GPS TRACKING</Text>
        </View>

        {showOtpPill && (
          <View style={[styles.otpTopCard, shadows.sm]}>
            <ShieldCheck color="#10B981" size={13} style={{ marginRight: 4 }} />
            <Text style={[styles.otpTopLabel, typography.micro]}>{otpLabel}:</Text>
            <Text style={[styles.otpTopCode, typography.captionBold]}> {activeOtp}</Text>
          </View>
        )}
      </View>

      {/* Floating Map Controls (Zoom / Reset) */}
      <View style={styles.controlsCol}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => setZoomLevel((z) => Math.min(z + 0.25, 2.2))}
          accessibilityLabel="Zoom in map"
        >
          <ZoomIn color="#FFFFFF" size={17} />
        </Pressable>
        <Pressable
          style={styles.iconBtn}
          onPress={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
          accessibilityLabel="Zoom out map"
        >
          <ZoomOut color="#FFFFFF" size={17} />
        </Pressable>
        {onResetSimulation && (
          <Pressable
            style={styles.iconBtn}
            onPress={onResetSimulation}
            accessibilityLabel="Restart courier simulation"
          >
            <RotateCcw color="#FFFFFF" size={15} />
          </Pressable>
        )}
      </View>

      {/* Bottom Floating Telemetry Pill: Speed + ETA */}
      <View style={[styles.telemetryPill, shadows.md]}>
        <View style={styles.telemetryIcon}>
          <Navigation color="#FFFFFF" size={13} />
        </View>
        <View>
          <Text style={[styles.telemetryTitle, typography.captionBold]}>
            {trackingState ? `${trackingState.etaMinutes} mins away` : 'Calculating ETA'}
          </Text>
          <Text style={[styles.telemetrySub, typography.micro]}>
            SPEED: {trackingState?.speedKmh ?? 28} KM/H • RIDER: {order.deliveryPartner?.name || 'Fahad Al-Saud'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  topHudRow: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePill: {
    backgroundColor: 'rgba(17, 24, 39, 0.88)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  livePillText: {
    color: '#F8FAFC',
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  otpTopCard: {
    backgroundColor: '#064E3B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#059669',
  },
  otpTopLabel: {
    color: '#A7F3D0',
    fontWeight: '700',
  },
  otpTopCode: {
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  controlsCol: {
    position: 'absolute',
    top: 12,
    right: 14,
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  telemetryPill: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
  },
  telemetryIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  telemetryTitle: {
    color: colors.textPrimary,
  },
  telemetrySub: {
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
});

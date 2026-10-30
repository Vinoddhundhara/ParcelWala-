import { DeliveryPartner, Order, OrderStatus, TrackingState, TrackingWaypoint } from '../../types';

export interface ITrackingService {
  getTrackingState(orderId: string): Promise<TrackingState | null>;
  startSimulation(order: Order, onUpdate: (state: TrackingState) => void): () => void;
}

export const MOCK_DELIVERY_PARTNERS: DeliveryPartner[] = [
  {
    id: 'dp_101',
    name: 'Vikram Singh',
    phone: '+91 98765 11223',
    rating: 4.85,
    totalDeliveries: 1420,
    vehicleNumber: 'KA 01 EK 4920',
    vehicleType: 'TVS King Deluxe Cargo',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'dp_102',
    name: 'Arjun Verma',
    phone: '+91 98765 44556',
    rating: 4.92,
    totalDeliveries: 2310,
    vehicleNumber: 'KA 03 MX 8812',
    vehicleType: 'Bajaj Maxima Z Electric',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
];

/**
 * Deterministic Simulated Tracking Engine
 *
 * Interpolates smooth waypoints between pickup and drop coords with realistic intermediate road turns.
 * Transitions through actual order lifecycle:
 *   driver_assigned -> arriving_pickup -> pickup_complete -> in_transit -> out_for_delivery -> delivered
 */
export class SimulatedTrackingEngine implements ITrackingService {
  private activeSimulations: Map<string, { intervalId: ReturnType<typeof setInterval>; state: TrackingState }> =
    new Map();

  generateWaypoints(order: Order): TrackingWaypoint[] {
    const pLat = order.pickupAddress.latitude;
    const pLon = order.pickupAddress.longitude;
    const dLat = order.dropAddress.latitude;
    const dLon = order.dropAddress.longitude;

    // Intermediate realistic bends for navigation
    const mid1Lat = pLat + (dLat - pLat) * 0.25 + 0.003;
    const mid1Lon = pLon + (dLon - pLon) * 0.25 - 0.002;

    const mid2Lat = pLat + (dLat - pLat) * 0.55 - 0.002;
    const mid2Lon = pLon + (dLon - pLon) * 0.55 + 0.003;

    const mid3Lat = pLat + (dLat - pLat) * 0.85 + 0.001;
    const mid3Lon = pLon + (dLon - pLon) * 0.85 + 0.001;

    return [
      {
        latitude: pLat - 0.006,
        longitude: pLon - 0.004,
        status: 'driver_assigned',
        label: 'Partner accepted order & heading to pickup',
        etaMinutes: 24,
      },
      {
        latitude: pLat - 0.002,
        longitude: pLon - 0.001,
        status: 'arriving_pickup',
        label: 'Partner reached pickup location',
        etaMinutes: 20,
      },
      {
        latitude: pLat,
        longitude: pLon,
        status: 'pickup_complete',
        label: 'Parcel picked up & verified',
        etaMinutes: 18,
      },
      {
        latitude: mid1Lat,
        longitude: mid1Lon,
        status: 'in_transit',
        label: 'In transit via main arterial road',
        etaMinutes: 14,
      },
      {
        latitude: mid2Lat,
        longitude: mid2Lon,
        status: 'in_transit',
        label: 'Crossing mid junction',
        etaMinutes: 10,
      },
      {
        latitude: mid3Lat,
        longitude: mid3Lon,
        status: 'out_for_delivery',
        label: 'Out for delivery in destination sector',
        etaMinutes: 5,
      },
      {
        latitude: dLat,
        longitude: dLon,
        status: 'delivered',
        label: 'Successfully delivered to recipient',
        etaMinutes: 0,
      },
    ];
  }

  async getTrackingState(orderId: string): Promise<TrackingState | null> {
    const sim = this.activeSimulations.get(orderId);
    return sim ? sim.state : null;
  }

  startSimulation(
    order: Order,
    onUpdate: (state: TrackingState) => void,
    intervalMs: number = 3500
  ): () => void {
    const existing = this.activeSimulations.get(order.id);
    if (existing) {
      clearInterval(existing.intervalId);
    }

    const waypoints = this.generateWaypoints(order);
    let currentIndex = 0;

    const computeHeading = (fromIdx: number, toIdx: number) => {
      const from = waypoints[fromIdx];
      const to = waypoints[toIdx] || waypoints[fromIdx];
      const y = Math.sin(to.longitude - from.longitude) * Math.cos(to.latitude);
      const x =
        Math.cos(from.latitude) * Math.sin(to.latitude) -
        Math.sin(from.latitude) * Math.cos(to.latitude) * Math.cos(to.longitude - from.longitude);
      const brng = (Math.atan2(y, x) * 180) / Math.PI;
      return (brng + 360) % 360;
    };

    const currentState: TrackingState = {
      orderId: order.id,
      currentWaypointIndex: 0,
      totalWaypoints: waypoints.length,
      currentCoord: {
        latitude: waypoints[0].latitude,
        longitude: waypoints[0].longitude,
      },
      heading: computeHeading(0, 1),
      status: waypoints[0].status,
      isSimulated: true,
      isPlaying: true,
      etaMinutes: waypoints[0].etaMinutes,
      speedKmh: 28,
      pickupOtp: order.pickupOtp || '8738',
      deliveryOtp: order.deliveryOtp || '4912',
    };

    onUpdate(currentState);

    const intervalId = setInterval(() => {
      if (!currentState.isPlaying) return;

      if (currentIndex < waypoints.length - 1) {
        currentIndex++;
        const nextWp = waypoints[currentIndex];
        currentState.currentWaypointIndex = currentIndex;
        currentState.currentCoord = {
          latitude: nextWp.latitude,
          longitude: nextWp.longitude,
        };
        currentState.status = nextWp.status;
        currentState.etaMinutes = nextWp.etaMinutes;
        currentState.heading = computeHeading(
          currentIndex,
          Math.min(currentIndex + 1, waypoints.length - 1)
        );
        currentState.speedKmh = nextWp.status === 'delivered' ? 0 : Math.floor(22 + Math.random() * 12);
        onUpdate({ ...currentState });

        if (nextWp.status === 'delivered') {
          clearInterval(intervalId);
        }
      } else {
        clearInterval(intervalId);
      }
    }, intervalMs);

    this.activeSimulations.set(order.id, { intervalId, state: currentState });

    return () => {
      clearInterval(intervalId);
      this.activeSimulations.delete(order.id);
    };
  }
}

export const trackingService = new SimulatedTrackingEngine();

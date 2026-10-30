import { create } from 'zustand';
import { Order, OrderStatus, TrackingState } from '../types';
import { trackingService } from '../services/tracking/trackingService';
import { useOrdersStore } from './useOrdersStore';

interface TrackingStoreState {
  currentOrder: Order | null;
  trackingState: TrackingState | null;
  isSimulating: boolean;
  stopSimulationCleanup: (() => void) | null;

  bindOrder: (order: Order) => void;
  startTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  resetSimulation: () => void;
  advanceNextStep: () => void;
  stopTracking: () => void;
}

export const useTrackingStore = create<TrackingStoreState>((set, get) => ({
  currentOrder: null,
  trackingState: null,
  isSimulating: false,
  stopSimulationCleanup: null,

  bindOrder: (order: Order) => {
    // If different order, stop old simulation
    const current = get().currentOrder;
    if (current && current.id !== order.id) {
      get().stopTracking();
    }
    set({ currentOrder: order });
    get().startTracking();
  },

  startTracking: () => {
    const order = get().currentOrder;
    if (!order) return;

    if (get().stopSimulationCleanup) {
      get().stopSimulationCleanup!();
    }

    const cleanup = trackingService.startSimulation(order, (state) => {
      set({ trackingState: state, isSimulating: true });
      // Sync order status in orders store
      useOrdersStore.getState().updateOrderStatus(order.id, state.status);
    });

    set({ stopSimulationCleanup: cleanup, isSimulating: true });
  },

  pauseTracking: () => {
    const state = get().trackingState;
    if (state) {
      set({ trackingState: { ...state, isPlaying: false } });
    }
  },

  resumeTracking: () => {
    const state = get().trackingState;
    if (state) {
      set({ trackingState: { ...state, isPlaying: true } });
    }
  },

  resetSimulation: () => {
    get().stopTracking();
    get().startTracking();
  },

  advanceNextStep: () => {
    const state = get().trackingState;
    const order = get().currentOrder;
    if (!state || !order) return;

    const waypoints = trackingService.generateWaypoints(order);
    const nextIdx = Math.min(state.currentWaypointIndex + 1, waypoints.length - 1);
    const nextWp = waypoints[nextIdx];

    const updatedState: TrackingState = {
      ...state,
      currentWaypointIndex: nextIdx,
      currentCoord: { latitude: nextWp.latitude, longitude: nextWp.longitude },
      status: nextWp.status,
      etaMinutes: nextWp.etaMinutes,
      speedKmh: nextWp.status === 'delivered' ? 0 : 25,
    };

    set({ trackingState: updatedState });
    useOrdersStore.getState().updateOrderStatus(order.id, nextWp.status);
  },

  stopTracking: () => {
    const cleanup = get().stopSimulationCleanup;
    if (cleanup) {
      cleanup();
    }
    set({ stopSimulationCleanup: null, isSimulating: false });
  },
}));


import { create } from 'zustand';
import {
  Address,
  FareBreakdown,
  Order,
  OrderStatus,
  OrderTimelineEvent,
  ParcelDetails,
  PaymentDetails,
  PaymentMethodType,
  ServiceType,
  VehicleType,
} from '../types';
import { localStorageService } from '../services/storage/asyncStorage';
import { MOCK_DELIVERY_PARTNERS } from '../services/tracking/trackingService';

interface OrdersState {
  orders: Order[];
  activeOrderId: string | null;
  isLoaded: boolean;
  isLoading: boolean;
  searchQuery: string;
  selectedFilter: 'all' | 'active' | 'completed' | 'cancelled';

  hydrate: () => Promise<void>;
  createOrder: (params: {
    pickupAddress: Address;
    dropAddress: Address;
    parcel: ParcelDetails;
    serviceType: ServiceType;
    vehicleType?: VehicleType;
    fareBreakdown: FareBreakdown;
    payment: PaymentDetails;
    idempotencyKey: string;
  }) => Promise<Order>;
  cancelOrder: (orderId: string, reason: string) => Promise<{ success: boolean; message: string; refundInr: number }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  setActiveOrder: (orderId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: 'all' | 'active' | 'completed' | 'cancelled') => void;
}

const buildInitialTimeline = (createdAt: string): OrderTimelineEvent[] => [
  {
    status: 'created',
    title: 'Order Placed',
    description: 'Booking confirmed and payment processed.',
    timestamp: createdAt,
    completed: true,
  },
  {
    status: 'driver_assigned',
    title: 'Delivery Partner Assigned',
    description: 'Vikram Singh accepted pickup request.',
    timestamp: new Date(Date.now() + 60000).toISOString(),
    completed: false,
  },
  {
    status: 'pickup_complete',
    title: 'Parcel Picked Up',
    description: 'Courier collected and verified the parcel.',
    timestamp: new Date(Date.now() + 600000).toISOString(),
    completed: false,
  },
  {
    status: 'in_transit',
    title: 'In Transit',
    description: 'Package is on the way to recipient address.',
    timestamp: new Date(Date.now() + 1200000).toISOString(),
    completed: false,
  },
  {
    status: 'delivered',
    title: 'Delivered',
    description: 'Handed over safely to receiver.',
    timestamp: new Date(Date.now() + 1800000).toISOString(),
    completed: false,
  },
];

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  activeOrderId: null,
  isLoaded: false,
  isLoading: false,
  searchQuery: '',
  selectedFilter: 'all',

  hydrate: async () => {
    try {
      const stored = await localStorageService.getOrders();
      set({ orders: stored || [], isLoaded: true });
      if (stored && stored.length > 0) {
        // Find first active order if any
        const active = stored.find(
          (o) => !['delivered', 'cancelled'].includes(o.status)
        );
        if (active) {
          set({ activeOrderId: active.id });
        }
      }
    } catch {
      set({ orders: [], isLoaded: true });
    }
  },

  createOrder: async ({
    pickupAddress,
    dropAddress,
    parcel,
    serviceType,
    vehicleType = 'bike',
    fareBreakdown,
    payment,
    idempotencyKey,
  }) => {
    // Check if order with this idempotency key already exists to prevent duplicate submissions
    const existing = get().orders.find((o) => o.idempotencyKey === idempotencyKey);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const trackingCode = `PG-${Math.floor(100000 + Math.random() * 900000)}`;
    const pickupOtp = String(Math.floor(1000 + Math.random() * 9000));
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      trackingCode,
      status: 'driver_assigned',
      pickupAddress,
      dropAddress,
      parcel,
      serviceType,
      vehicleType,
      pickupOtp,
      deliveryOtp,
      fareBreakdown,
      payment,
      deliveryPartner: MOCK_DELIVERY_PARTNERS[0],
      timeline: buildInitialTimeline(now),
      idempotencyKey,
      createdAt: now,
      updatedAt: now,
      isSimulated: true,
    };

    const updated = [newOrder, ...get().orders];
    await localStorageService.saveOrders(updated);
    set({ orders: updated, activeOrderId: newOrder.id });
    return newOrder;
  },

  cancelOrder: async (orderId: string, reason: string) => {
    const order = get().getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Cancellation policy: Cannot cancel if already picked up or in transit
    if (['pickup_complete', 'in_transit', 'out_for_delivery', 'delivered'].includes(order.status)) {
      return {
        success: false,
        message: 'Order cannot be cancelled after the parcel has been picked up by the courier.',
        refundInr: 0,
      };
    }

    if (order.status === 'cancelled') {
      return {
        success: false,
        message: 'Order is already cancelled.',
        refundInr: 0,
      };
    }

    // Refund policy in dev mode: Full refund if driver assigned or created
    const refundInr = order.payment.status === 'completed' ? order.fareBreakdown.totalInr : 0;
    const now = new Date().toISOString();

    const updatedTimeline: OrderTimelineEvent[] = [
      ...order.timeline,
      {
        status: 'cancelled',
        title: 'Order Cancelled',
        description: `Reason: ${reason}. Refund of ₹${refundInr} initiated.`,
        timestamp: now,
        completed: true,
      },
    ];

    const updatedOrders = get().orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'cancelled' as OrderStatus,
          cancellationReason: reason,
          cancelledAt: now,
          timeline: updatedTimeline,
          payment: {
            ...o.payment,
            status: refundInr > 0 ? ('refunded' as const) : o.payment.status,
          },
        };
      }
      return o;
    });

    await localStorageService.saveOrders(updatedOrders);
    set({ orders: updatedOrders });

    return {
      success: true,
      message: `Your booking has been cancelled. Refund of ₹${refundInr} has been credited to your original payment method.`,
      refundInr,
    };
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const updated = get().orders.map((o) => {
      if (o.id === orderId) {
        const updatedTimeline = o.timeline.map((event) => {
          if (event.status === status) {
            return { ...event, completed: true, timestamp: new Date().toISOString() };
          }
          return event;
        });

        return {
          ...o,
          status,
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      }
      return o;
    });

    await localStorageService.saveOrders(updated);
    set({ orders: updated });
  },

  getOrderById: (orderId: string) => {
    return get().orders.find((o) => o.id === orderId);
  },

  setActiveOrder: (orderId: string | null) => {
    set({ activeOrderId: orderId });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSelectedFilter: (filter: 'all' | 'active' | 'completed' | 'cancelled') => {
    set({ selectedFilter: filter });
  },
}));


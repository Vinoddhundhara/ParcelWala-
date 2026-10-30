import { useOrdersStore } from '../store/useOrdersStore';
import { MockPaymentAdapter } from '../services/payments/paymentService';
import { Address, FareBreakdown, ParcelDetails } from '../types';

describe('Order & Payment Lifecycle', () => {
  const dummyPickup: Address = {
    id: 'p_1',
    label: 'Home',
    contactName: 'Rohit',
    contactPhone: '9876543210',
    streetAddress: '100ft Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    latitude: 12.9784,
    longitude: 77.6408,
  };

  const dummyDrop: Address = {
    id: 'd_1',
    label: 'Work',
    contactName: 'Sneha',
    contactPhone: '9876512345',
    streetAddress: '80ft Road, Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560034',
    latitude: 12.9352,
    longitude: 77.6245,
  };

  const dummyParcel: ParcelDetails = {
    category: 'small',
    description: 'Electronics & Headphones',
    weightKg: 2,
    lengthCm: 20,
    widthCm: 15,
    heightCm: 10,
    declaredValueInr: 2500,
  };

  const dummyFare: FareBreakdown = {
    baseFare: 30,
    distanceKm: 6.2,
    distanceCharge: 50,
    weightKg: 2,
    weightSurcharge: 12,
    sizeSurcharge: 10,
    serviceType: 'standard',
    serviceSurcharge: 0,
    platformFee: 5,
    taxGst: 19,
    discount: 0,
    totalInr: 126,
    estimatedMinutes: 32,
  };

  describe('MockPaymentAdapter', () => {
    const paymentAdapter = new MockPaymentAdapter();

    it('processes successful payment and returns valid transaction details', async () => {
      const result = await paymentAdapter.processPayment({
        orderId: 'ord_123',
        amountInr: 126,
        method: 'upi',
        idempotencyKey: 'idem_test_1',
        mockOutcome: 'success',
      });

      expect(result.status).toBe('completed');
      expect(result.method).toBe('upi');
      expect(result.transactionId).toBeDefined();
    });

    it('enforces idempotency - identical key returns cached transaction', async () => {
      const first = await paymentAdapter.processPayment({
        orderId: 'ord_123',
        amountInr: 126,
        method: 'upi',
        idempotencyKey: 'idem_duplicate_test',
        mockOutcome: 'success',
      });

      const second = await paymentAdapter.processPayment({
        orderId: 'ord_123',
        amountInr: 126,
        method: 'upi',
        idempotencyKey: 'idem_duplicate_test',
        mockOutcome: 'success',
      });

      expect(first.transactionId).toBe(second.transactionId);
    });

    it('handles simulated bank decline failure scenario', async () => {
      const result = await paymentAdapter.processPayment({
        orderId: 'ord_fail',
        amountInr: 126,
        method: 'card',
        idempotencyKey: 'idem_fail_1',
        mockOutcome: 'failure',
      });

      expect(result.status).toBe('failed');
      expect(result.errorMessage).toContain('declined');
    });

    it('handles user cancelled payment flow', async () => {
      const result = await paymentAdapter.processPayment({
        orderId: 'ord_cancel',
        amountInr: 126,
        method: 'upi',
        idempotencyKey: 'idem_cancel_1',
        mockOutcome: 'cancelled',
      });

      expect(result.status).toBe('failed');
      expect(result.errorMessage).toContain('cancelled by the user');
    });
  });

  describe('Orders Store Management', () => {
    it('creates an order and sets it active', async () => {
      const order = await useOrdersStore.getState().createOrder({
        pickupAddress: dummyPickup,
        dropAddress: dummyDrop,
        parcel: dummyParcel,
        serviceType: 'standard',
        fareBreakdown: dummyFare,
        payment: { method: 'upi', status: 'completed', transactionId: 'txn_test' },
        idempotencyKey: 'idem_order_create_1',
      });

      expect(order.trackingCode).toMatch(/^PG-\d{6}$/);
      expect(order.status).toBe('driver_assigned');
      expect(useOrdersStore.getState().activeOrderId).toBe(order.id);
    });

    it('prevents duplicate order creation with same idempotency key', async () => {
      const key = 'idem_duplicate_order_check';
      const order1 = await useOrdersStore.getState().createOrder({
        pickupAddress: dummyPickup,
        dropAddress: dummyDrop,
        parcel: dummyParcel,
        serviceType: 'standard',
        fareBreakdown: dummyFare,
        payment: { method: 'upi', status: 'completed' },
        idempotencyKey: key,
      });

      const order2 = await useOrdersStore.getState().createOrder({
        pickupAddress: dummyPickup,
        dropAddress: dummyDrop,
        parcel: dummyParcel,
        serviceType: 'standard',
        fareBreakdown: dummyFare,
        payment: { method: 'upi', status: 'completed' },
        idempotencyKey: key,
      });

      expect(order1.id).toBe(order2.id);
    });

    it('cancels an order when status is driver_assigned and calculates full refund', async () => {
      const order = await useOrdersStore.getState().createOrder({
        pickupAddress: dummyPickup,
        dropAddress: dummyDrop,
        parcel: dummyParcel,
        serviceType: 'standard',
        fareBreakdown: dummyFare,
        payment: { method: 'upi', status: 'completed' },
        idempotencyKey: 'idem_cancel_test',
      });

      const cancelResult = await useOrdersStore
        .getState()
        .cancelOrder(order.id, 'Changed destination address');

      expect(cancelResult.success).toBe(true);
      expect(cancelResult.refundInr).toBe(dummyFare.totalInr);

      const updated = useOrdersStore.getState().getOrderById(order.id);
      expect(updated?.status).toBe('cancelled');
      expect(updated?.payment.status).toBe('refunded');
    });

    it('rejects cancellation once order is in transit or delivered', async () => {
      const order = await useOrdersStore.getState().createOrder({
        pickupAddress: dummyPickup,
        dropAddress: dummyDrop,
        parcel: dummyParcel,
        serviceType: 'standard',
        fareBreakdown: dummyFare,
        payment: { method: 'upi', status: 'completed' },
        idempotencyKey: 'idem_transit_test',
      });

      await useOrdersStore.getState().updateOrderStatus(order.id, 'in_transit');

      const cancelResult = await useOrdersStore
        .getState()
        .cancelOrder(order.id, 'Too late to cancel');

      expect(cancelResult.success).toBe(false);
      expect(cancelResult.message).toContain('cannot be cancelled');
    });
  });
});


import { ENV } from '../../config/env';
import { PaymentDetails, PaymentMethodType, PaymentStatus } from '../../types';

export interface ProcessPaymentParams {
  orderId: string;
  amountInr: number;
  method: PaymentMethodType;
  idempotencyKey: string;
  mockOutcome?: 'success' | 'failure' | 'cancelled'; // For testing all edge cases
}

export interface IPaymentService {
  processPayment(params: ProcessPaymentParams): Promise<PaymentDetails>;
  verifyPayment(transactionId: string): Promise<PaymentStatus>;
}

/**
 * Clearly Labeled Development-Only Mock Payment Adapter
 */
export class MockPaymentAdapter implements IPaymentService {
  private transactionHistory: Map<string, PaymentDetails> = new Map();

  async processPayment(params: ProcessPaymentParams): Promise<PaymentDetails> {
    const { orderId, amountInr, method, idempotencyKey, mockOutcome = 'success' } = params;

    // Check idempotency - prevent double charges
    if (this.transactionHistory.has(idempotencyKey)) {
      return this.transactionHistory.get(idempotencyKey)!;
    }

    // Simulate payment gateway roundtrip delay
    await new Promise((res) => setTimeout(res, 1200));

    if (mockOutcome === 'cancelled') {
      const result: PaymentDetails = {
        method,
        status: 'failed',
        errorMessage: 'Payment was cancelled by the user in the payment gateway sheet.',
      };
      return result;
    }

    if (mockOutcome === 'failure') {
      const result: PaymentDetails = {
        method,
        status: 'failed',
        errorMessage: 'Bank declined the transaction. Insufficient funds or invalid credentials.',
      };
      return result;
    }

    // Success scenario
    const transactionId = `txn_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const result: PaymentDetails = {
      method,
      status: method === 'cod' ? 'pending' : 'completed',
      transactionId,
      paidAt: method === 'cod' ? undefined : new Date().toISOString(),
      upiId: method === 'upi' ? 'customer@okhdfcbank' : undefined,
    };

    this.transactionHistory.set(idempotencyKey, result);
    return result;
  }

  async verifyPayment(transactionId: string): Promise<PaymentStatus> {
    await new Promise((res) => setTimeout(res, 400));
    return 'completed';
  }
}

export class ProductionPaymentService implements IPaymentService {
  async processPayment(): Promise<PaymentDetails> {
    throw new Error('Production payment gateway requires backend integration.');
  }
  async verifyPayment(): Promise<PaymentStatus> {
    throw new Error('Production payment gateway requires backend integration.');
  }
}

export const paymentService: IPaymentService = ENV.USE_MOCK_SERVICES
  ? new MockPaymentAdapter()
  : new ProductionPaymentService();


import PaymentService from '../../repo/payment-service/src/services/paymentService';
import Payment from '../../repo/payment-service/src/model/paymentModel';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../model/paymentModel');
jest.mock('axios');
jest.mock('uuid');

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
    jest.clearAllMocks();
  });

  const mockUserId = 'user123';
  const mockOrderId = 'order123';
  const mockPaymentMethod = 'credit_card';
  const mockTransactionId = 'transaction123';

  const mockOrder = {
    _id: mockOrderId,
    userId: mockUserId,
    totalAmount: 100,
    status: 'pending'
  };

  const mockPayment = {
    orderId: mockOrderId,
    userId: mockUserId,
    amount: 100,
    status: 'completed',
    paymentMethod: mockPaymentMethod,
    transactionId: mockTransactionId
  };

  describe('processPayment', () => {
    it('should process a payment successfully', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: mockOrder });
      (axios.patch as jest.Mock).mockResolvedValue({});
      (uuidv4 as jest.Mock).mockReturnValue(mockTransactionId);
      (Payment.prototype.save as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentService.processPayment(mockUserId, mockOrderId, mockPaymentMethod);

      expect(result).toEqual(mockPayment);
      expect(axios.get).toHaveBeenCalledWith(`${process.env.ORDER_SERVICE_URL}/api/orders/${mockOrderId}`, {
        headers: { Authorization: `Bearer ${process.env.INTER_SERVICE_TOKEN}` }
      });
      expect(axios.patch).toHaveBeenCalledWith(
        `${process.env.ORDER_SERVICE_URL}/api/orders/${mockOrderId}/status`,
        { status: 'processing' },
        { headers: { Authorization: `Bearer ${process.env.INTER_SERVICE_TOKEN}` } }
      );
      expect(Payment.prototype.save).toHaveBeenCalled();
    });

    it('should throw an error if user does not own the order', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: { ...mockOrder, userId: 'differentUser' } });

      await expect(paymentService.processPayment(mockUserId, mockOrderId, mockPaymentMethod))
        .rejects.toThrow('Unauthorized: User does not own this order');
    });

    it('should throw an error if order status is not pending', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: { ...mockOrder, status: 'processing' } });

      await expect(paymentService.processPayment(mockUserId, mockOrderId, mockPaymentMethod))
        .rejects.toThrow('Invalid order status for payment');
    });

    it('should handle payment failure', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: mockOrder });
      (uuidv4 as jest.Mock).mockReturnValue(mockTransactionId);
      (Payment.prototype.save as jest.Mock).mockResolvedValue({ ...mockPayment, status: 'failed' });

      // Force the simulatePaymentGateway to return false
      jest.spyOn(Math, 'random').mockReturnValue(0.95);

      const result = await paymentService.processPayment(mockUserId, mockOrderId, mockPaymentMethod);

      expect(result.status).toBe('failed');
      expect(axios.patch).not.toHaveBeenCalled(); // Order status should not be updated on failure
    });
  });

  describe('getPaymentByOrderId', () => {
    it('should return a payment by order id', async () => {
      (Payment.findOne as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentService.getPaymentByOrderId(mockOrderId, mockUserId);

      expect(result).toEqual(mockPayment);
      expect(Payment.findOne).toHaveBeenCalledWith({ orderId: mockOrderId, userId: mockUserId });
    });

    it('should return null if payment is not found', async () => {
      (Payment.findOne as jest.Mock).mockResolvedValue(null);

      const result = await paymentService.getPaymentByOrderId('nonexistent', mockUserId);

      expect(result).toBeNull();
    });
  });

  // Test for private method simulatePaymentGateway
  describe('simulatePaymentGateway', () => {
    it('should simulate a payment gateway', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5); // Ensure success
      (uuidv4 as jest.Mock).mockReturnValue(mockTransactionId);

      const result = await (paymentService as any).simulatePaymentGateway(100, mockPaymentMethod);

      expect(result).toEqual({
        success: true,
        transactionId: mockTransactionId
      });
    });
  });
});
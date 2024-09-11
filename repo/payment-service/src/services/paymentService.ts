import Payment, { IPayment } from '../model/paymentModel';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; //unique id



export default class PaymentService {
    async processPayment(userId: string, orderId: string, paymentMethod: string): Promise<IPayment> {
      // Fetch order details from Order Microservice
      const orderResponse = await axios.get(`${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${process.env.INTER_SERVICE_TOKEN}` }
      });
      const order = orderResponse.data;
  
      if (order.userId !== userId) {
        throw new Error('Unauthorized: User does not own this order');
      }
  
      if (order.status !== 'pending') {
        throw new Error('Invalid order status for payment');
      }
  
      // Simulate payment process
      const paymentResult = await this.simulatePaymentGateway(order.totalAmount, paymentMethod);
  
      const payment = new Payment({
        orderId: order._id,
        userId: userId,
        amount: order.totalAmount,
        status: paymentResult.success ? 'completed' : 'failed',
        paymentMethod: paymentMethod,
        transactionId: paymentResult.transactionId,
      });
  
      await payment.save();
  
      if (payment.status === 'completed') {
        // Update order status
        await axios.patch(
          `${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}/status`,
          { status: 'processing' },
          { headers: { Authorization: `Bearer ${process.env.INTER_SERVICE_TOKEN}` } }
        );
      }
  
      return payment;
    }
  
    private async simulatePaymentGateway(amount: number, paymentMethod: string): Promise<{ success: boolean; transactionId: string }> {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Simulate success rate (90% success)
      const success = Math.random() < 0.9;
  
      return {
        success,
        transactionId: uuidv4()
      };
    }
  
    async getPaymentByOrderId(orderId: string, userId: string): Promise<IPayment | null> {
      return await Payment.findOne({ orderId, userId });
    }
  }
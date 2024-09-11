import { Request, Response } from 'express';
import PaymentService from '../services/paymentService';
//import { AuthenticatedRequest } from '../types/payment';

const paymentService = new PaymentService();

export default class PaymentController {
  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, paymentMethod } = req.body;
      const payment = await paymentService.processPayment(req.user!._id, orderId, paymentMethod);
      res.status(201).json(payment);
    } catch (err) {
      console.error('Error processing payment:', err);
      res.status(400).json({
        message: 'Error processing payment'
      });
    }
  }

  async getPaymentByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const payment = await paymentService.getPaymentByOrderId(req.params.orderId, req.user!._id);
      if (payment) {
        res.json(payment);
      } else {
        res.status(404).json({
          message: 'Payment not found'
        });
      }
    } catch (err) {
      console.error('Error fetching payment:', err);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  }
}
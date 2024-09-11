import express from 'express';
import PaymentController from '../controllers/paymentController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();
const paymentController = new PaymentController();

router.post('/process', verifyToken, paymentController.processPayment);
router.get('/order/:orderId', verifyToken, paymentController.getPaymentByOrderId);

export default router;
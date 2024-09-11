import express from 'express';
import OrderController from '../controllers/orderController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();
const orderController = new OrderController();

router.post('/create-order', verifyToken, orderController.createOrder);
router.get('/:id', verifyToken, orderController.getOrderById);
router.get('/user/orders', verifyToken, orderController.getOrdersByUserId);
router.patch('/:id/status', verifyToken, orderController.updateOrderStatus);

export default router;
import { Request, Response } from 'express';
import OrderService from '../services/orderService';
import { IOrder } from '../types/order';

const orderService = new OrderService();

export default class OrderController {
    async createOrder( req: Request, res: Response): Promise<void> {

        try {
            const order = await orderService.createOrder(req.user!._id, req.body as Partial<IOrder>);
            res.status(201).json(order);
        } catch(err) {
            console.error('Error creating order:', err);
            res.status(400).json({
                message: 'Error creating order'
            });
        }
    }

    async getOrderById( req: Request, res: Response): Promise<void> {
        try {
            const order = await orderService.getOrderById(req.user!._id, req.params.id)
            if(order){
                res.json(order);
            } else {
                res.status(404).json ({
                    message: 'Order not found'
                });
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            res.status(500).json({
              message: 'Internal server error'
            });
        }
    }

    async getOrdersByUserId(req: Request, res: Response): Promise<void> {
        try {
          const orders = await orderService.getOrderByUserId(req.user!._id);
          res.json(orders);
        } catch (err) {
          console.error('Error fetching orders:', err);
          res.status(500).json({
            message: 'Internal server error'
          });
        }
      }
    
      async updateOrderStatus(req: Request, res: Response): Promise<void> {
        try {
          const order = await orderService.updateOrderStatus( req.user!._id, req.params.id, req.body.status);
          if (order) {
            res.json(order);
          } else {
            res.status(404).json({
              message: 'Order not found'
            });
          }
        } catch (err) {
          console.error('Error updating order status:', err);
          res.status(400).json({
            message: 'Error updating order status'
          });
        }
    }
}
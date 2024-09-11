import OrderService from '../../repo/order-service/src/services/orderService';
import Order from '../../repo/order-service/src/models/orderModel';
import axios from 'axios';
import { IOrder } from '../../repo/order-service/src/types/order';
import { ObjectId } from 'mongodb';

jest.mock('../models/orderModel');
jest.mock('axios');

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  
  const mockUserId = 'user123';
  const mockOrderId = 'order123';
  const mockProductId = 'product123';
  const mockProductResponse = {
    data: { quantity: 5, price: 10 }
  };


  const mockOrder: IOrder = {
    _id: new ObjectId(mockOrderId),
    userId: new ObjectId(mockUserId),
    products: [
      { productId: new ObjectId(mockProductId), quantity: 2, price: mockProductResponse.data.price } // Add the price here
    ],
    totalAmount: 20,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const mockProductResponse = {
        data: { quantity: 5, price: 10 }
      };
      (axios.get as jest.Mock).mockResolvedValue(mockProductResponse);
      (axios.patch as jest.Mock).mockResolvedValue({});
      (Order.prototype.save as jest.Mock).mockResolvedValue(mockOrder);

      const productIdAsObjectId = new ObjectId(mockProductId);

      const result = await orderService.createOrder(mockUserId, {
      products: [{ productId: productIdAsObjectId, quantity: 2, price:mockProductResponse.data.price }]
    });

      expect(result).toEqual(mockOrder);
      expect(axios.get).toHaveBeenCalledWith(`${process.env.PRODUCT_SERVICE_URL}/api/products/${mockProductId}`);
      expect(axios.patch).toHaveBeenCalledWith(`${process.env.PRODUCT_SERVICE_URL}/api/products/${mockProductId}`, {
        quantity: 3
      });
      expect(Order.prototype.save).toHaveBeenCalled();
    });

    it('should throw an error if product is out of stock', async () => {
      const mockProductResponse = {
        data: { quantity: 1, price: 10 }
      };
      (axios.get as jest.Mock).mockResolvedValue(mockProductResponse);

      const productIdAsObjectId = new ObjectId(mockProductId);
      await expect(orderService.createOrder(mockUserId, {
        products: [{ productId: productIdAsObjectId, quantity: 2, price:mockProductResponse.data.price }]
      })).rejects.toThrow('Insufficient quantity for product product123');
    });

    it('should throw an error if no products are provided', async () => {
      await expect(orderService.createOrder(mockUserId, {})).rejects.toThrow('No products provided for the order');
    });
  });

  describe('getOrderById', () => {
    it('should return an order by id', async () => {
      (Order.findOne as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(mockOrderId, mockUserId);

      expect(result).toEqual(mockOrder);
      expect(Order.findOne).toHaveBeenCalledWith({ _id: mockOrderId, userId: mockUserId });
    });

    it('should return null if order is not found', async () => {
      (Order.findOne as jest.Mock).mockResolvedValue(null);

      const result = await orderService.getOrderById('nonexistent', mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('getOrderByUserId', () => {
    it('should return all orders for a user', async () => {
      (Order.find as jest.Mock).mockResolvedValue([mockOrder]);

      const result = await orderService.getOrderByUserId(mockUserId);

      expect(result).toEqual([mockOrder]);
      expect(Order.find).toHaveBeenCalledWith({ userId: mockUserId });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the status of an order', async () => {
      const updatedOrder = { ...mockOrder, status: 'processing' };
      (Order.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedOrder);

      const result = await orderService.updateOrderStatus(mockOrderId, mockUserId, 'processing');

      expect(result).toEqual(updatedOrder);
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockOrderId, userId: mockUserId },
        { status: 'processing' },
        { new: true }
      );
    });

    it('should return null if order is not found', async () => {
      (Order.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await orderService.updateOrderStatus('nonexistent', mockUserId, 'processing');

      expect(result).toBeNull();
    });
  });
});




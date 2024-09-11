import Order from '../models/orderModel';
import { IOrder } from '../types/order';
import axios from 'axios';


export default class OrderService {

    private async validateAndUpdateProduct(products: IOrder['products']): Promise<IOrder['products']> {
        const validProducts = [];
        for(const product of products) {
            try {
                const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${product.productId}`);
                const productData = response.data;
    
                //check if product is still in stock
                if(productData.quantity < product.quantity) {
                    throw new Error(`Insufficient quantity for product ${product.productId}`);
                }
    
                //Update product quantity
    
                await axios.patch(`${process.env.PRODUCT_SERVICE_URL}/api/products/${product.productId}`, {
                    quantity: productData.quantity - product.quantity
                  });
                  validProducts.push({
                    ...product,
                    price: productData.price
                  });
            } catch (err) {
                throw new Error(`Invalid product: ${product.productId}`);
            }
        }
        return validProducts;
    }
    
    async createOrder(userId: string, orderData: Partial<IOrder>): Promise<IOrder> {
        if (!orderData.products) {
            throw new Error('No products provided for the order');
        }
        const validProducts = await this.validateAndUpdateProduct(orderData.products);

        const totalAmount = validProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
        const order = new Order({
            userId,
            products: validProducts,
            totalAmount,
            status: 'pending'
        });

        return await order.save()
    }

    async getOrderById(id: string, userId: string): Promise<IOrder[] | null> {
        return await Order.findOne({ _id: id, userId })
    }

    async getOrderByUserId(userId: string): Promise<IOrder[]> {
        return await Order.find({ userId })
    }

    async updateOrderStatus(id: string, userId: string, status: IOrder['status']): Promise<IOrder | null> {
        return await Order.findOneAndUpdate({ _id: id, userId}, { status }, { new: true});
    }
}
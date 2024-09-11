import { request } from '../../setup';
import { UserModel } from '../../repo/user-service/src/models/users';
import  OrderModel  from '../../repo/order-service/src/models/orderModel';
import  PaymentModel  from '../../repo/payment-service/src/model/paymentModel';

describe('Payment Service Integration Tests', () => {
  let userToken: string;
  let orderId: string;

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});
    await PaymentModel.deleteMany({});

    // Create a user and get the token
    const registerResponse = await request
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    userToken = registerResponse.body.accessToken;

    // Create an order
    const orderResponse = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        products: [
          { productId: '60d5ecb74f421f2ab8000001', quantity: 2 }
        ]
      });

    orderId = orderResponse.body._id;
  });

  it('should process a payment for an order', async () => {
    const paymentResponse = await request
      .post('/api/payments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        orderId: orderId,
        paymentMethod: 'credit_card'
      });

    expect(paymentResponse.status).toBe(201);
    expect(paymentResponse.body).toHaveProperty('transactionId');
    expect(paymentResponse.body.status).toBe('completed');

    // Check if the order status has been updated
    const orderResponse = await request
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(orderResponse.body.status).toBe('processing');
  });
});
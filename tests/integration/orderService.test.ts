import { request } from '../../setup';
import { UserModel } from '../../repo/user-service/src/models/users';
import  OrderModel  from '../../repo/order-service/src/models/orderModel';

describe('Order Service Integration Tests', () => {
  let userToken: string;

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});

    // Create a user and get the token
    const registerResponse = await request
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    userToken = registerResponse.body.accessToken;
  });

  it('should create a new order', async () => {
    const orderResponse = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        products: [
          { productId: '60d5ecb74f421f2ab8000001', quantity: 2 }
        ]
      });

    expect(orderResponse.status).toBe(201);
    expect(orderResponse.body).toHaveProperty('_id');
    expect(orderResponse.body.status).toBe('pending');
  });
});
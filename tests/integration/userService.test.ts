import { request } from '../../setup';
import { UserModel } from '../../repo/user-service/src/models/users';

describe('User Service Integration Tests', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  it('should register a new user and login', async () => {
    // Register a new user
    const registerResponse = await request
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty('accessToken');

    // Login with the new user
    const loginResponse = await request
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(loginResponse.status).toBe(201);
    expect(loginResponse.body).toHaveProperty('accessToken');
  });
});
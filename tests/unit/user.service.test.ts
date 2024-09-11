import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { UserModel, IUser } from '../../repo/user-service/src/models/users';
import * as jwt from '../../repo/user-service/src/middleware/jwt';
import { registerUser, loginUser, getUser, updateUserProfile } from '../../repo/user-service/src/controllers/auth';

jest.mock('../models/users');
jest.mock('bcrypt');
jest.mock('../middleware/jwt');

describe('Authentication Service', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};
    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = responseObject;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      };

      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (UserModel.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.signToken as jest.Mock).mockReturnValue('mockToken');

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: 'success',
        accessToken: 'mockToken',
        data: { user: mockUser },
      });
    });

    it('should return an error if user already exists', async () => {
      mockRequest.body = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue({ email: 'existing@example.com' });

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(409);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: false,
        message: 'User already exists',
      });
    });
  });

  describe('loginUser', () => {
    it('should login a user successfully', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.signToken as jest.Mock).mockReturnValue('mockToken');

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: 'success',
        accessToken: 'mockToken',
        data: { user: expect.objectContaining({ email: 'test@example.com' }) },
      });
    });

    it('should return an error for invalid credentials', async () => {
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Invalid email',
      });
    });
  });

  describe('getUser', () => {
    it('should get user profile successfully', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      };

      (mockRequest as any).user = { _id: mockUser._id };
      (UserModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await getUser(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUser },
      });
    });

    it('should return an error if user is not found', async () => {
      (mockRequest as any).user = { _id: new mongoose.Types.ObjectId() };
      (UserModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await getUser(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'updateduser',
        email: 'updated@example.com',
        role: 'user',
      };

      (mockRequest as any).user = { _id: mockUser._id };
      mockRequest.body = {
        username: 'updateduser',
        email: 'updated@example.com',
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await updateUserProfile(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUser },
      });
    });

    it('should return an error if email is already in use', async () => {
      (mockRequest as any).user = { _id: new mongoose.Types.ObjectId() };
      mockRequest.body = {
        email: 'existing@example.com',
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue({ email: 'existing@example.com' });

      await updateUserProfile(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(409);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Email already in use',
      });
    });
  });
});
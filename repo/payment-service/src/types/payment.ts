import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
}
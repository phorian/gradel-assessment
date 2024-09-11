import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

interface DecodedToken {
  _id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'mongodb://localhost:36371/user-service';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No auth token, access denied' });
    }

    const response = await axios.post(`${USER_SERVICE_URL}/api/users/verify-token`, { token });
    
    if (response.data.valid) {
      req.user = response.data.user;
      return next();
    } else {
      res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying token', error });
  }
};

export const vendorRoleCheck = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'vendor') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Vendor role required.' });
  }
};
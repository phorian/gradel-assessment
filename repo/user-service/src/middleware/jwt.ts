import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import { UserModel,IUser } from '../models/users';
import { resolve } from 'path';
import { rejects } from 'assert';
//import User from '../models/users';

interface UserPayload {
    id: string,
    username?: string;
    email?: string;
    role: string;
}

interface UserForToken {
    _id: Types.ObjectId | string;
    username: string;
    email: string;
    role: string;
  }

  interface AuthRequest extends Request {
    user?: IUser
  }

  //Function to Extract Token From Header
  function extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer')){
        return null;
    }
    return authHeader.split(' ')[1];
  }

  //Validate Extracted Token
  function validateToken(token: string): Promise<{id: string}> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET_KEY!, (err, decoded) => {
            if (err || !decoded || typeof decoded !== 'object') {
                reject (new Error('Invalid token'));
            } else {
                resolve(decoded as {id: string});
            }
        });
    });
  }

  //Function to find User
  async function findUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;
const JWT_EXPIRE = process.env.JWT_EXP || '1h'


if (!SECRET_KEY) {
    throw new Error('ACCESS_TOKEN_SECRET is not set in environment variables');
  }

//Jwt signToken
export const signToken = (user: UserForToken): string => {
    try {
        const payload: UserPayload = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, SECRET_KEY, {
            expiresIn: JWT_EXPIRE || '1d',
        });
    } catch (error) {
        console.error('Error signing JWT for new user:', error);
        throw new Error('Failed to sign token for new user');
    }
}

export const verifyToken = async ( req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        //Read token from the auth header
        const token = extractTokenFromHeader(req);
        if(!token){
            return res.status(401).json({
                message: 'No token found'
            });
        }

        //Token Validation
        const decodedToken = await validateToken(token);

        //Confirm user exists
        const user = await findUserById(decodedToken.id);
        if(!user){
            return res.status(401).json({
                message: 'User not found'
            }); // --> User not found
        }

        //Allow user access to the route
        (req as any).user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };;
        return next();
    } catch (error) {
        console.error('Error verifying JWT:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}

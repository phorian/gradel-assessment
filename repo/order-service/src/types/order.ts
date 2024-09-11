import { Types } from "mongoose";

export interface IOrder {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    products: Array<{
        productId: Types.ObjectId;
        quantity: number;
        price: number;

}>;
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

/*export interface AuthenticatedRequest extends Request {
    user?: {
      _id: string;
      username: string;
      email: string;
      role: string;
    };
  }*/
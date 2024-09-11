import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId: string;
}

const paymentSchema: Schema = new Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true },
}, { timestamps: true });


export default mongoose.model<IPayment>('Payment', paymentSchema);

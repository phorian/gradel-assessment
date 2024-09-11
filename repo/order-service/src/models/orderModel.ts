import mongoose, { Schema, Document, Model } from "mongoose";
import { IOrder } from "../types/order";

const orderSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    products: [{
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
        quantity: { type: Number, required: true },
        price: { type: Number, required: true}
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'processing', 'shipped', 'delivered', 'cancelled'], default:  'pending'},
}, {timestamps: true });

export default mongoose.model<IOrder & Document>('Order', orderSchema);
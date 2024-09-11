import mongoose, { Schema, Document } from "mongoose";
import { IProduct } from "../types/product";


const productSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, default: 0 },
}, {timestamps: true });

export default mongoose.model<IProduct & Document>('Product', productSchema)
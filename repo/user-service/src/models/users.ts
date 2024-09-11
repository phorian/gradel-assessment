import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";



export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    role: 'user' | 'vendor';
}


const UserSchema: Schema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, validate: [validator.isEmail, 'Please enter a valid email.'] },
    password: { type: String, minlength: 6, required: true, select: false },
    role: {type: String, enum: ['user', 'vendor'],default: 'user'},
}, {timestamps: true});




export const UserModel = mongoose.model<IUser>('User', UserSchema) 
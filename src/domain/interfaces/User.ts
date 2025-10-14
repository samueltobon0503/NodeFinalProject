import { model, Schema } from "mongoose"
import { IUser } from "../models/IUser";

const userSchema = new Schema<IUser>({
    id: { type: String, required: true},
    name: { type: String, required: true},
    lastName: { type: String, required: true},
    email: { type: String, required: true},
    userName: { type: String, required: true},
    isAdmin: { type: Boolean, default: false, required: true},
    createdAt: { type: Date, default: new Date()},
});

export const User = model<IUser>('User', userSchema);
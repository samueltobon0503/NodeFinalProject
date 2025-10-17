import { model, Schema } from "mongoose"
import { IUser } from "../models/IUser";

const userSchema = new Schema<IUser>({
    name: { type: String, required: true},
    lastName: { type: String, required: true},
    email: { type: String, required: true},
    userName: { type: String, required: true},
    password: {type: String, required: true},
    isAdmin: { type: Boolean, default: false, required: true},
    createdAt: { type: Date, default: new Date()},
    active: { type: Boolean, default: false, required: true},
});

export const User = model<IUser>('User', userSchema);
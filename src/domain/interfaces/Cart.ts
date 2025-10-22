import { Schema, model } from "mongoose";
import { ICart, ICartItem } from "../models/ICart";

const cartItemSchema = new Schema<ICartItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  priceLockedUntil: { type: Date, required: true },
});

const cartSchema = new Schema<ICart>({
  userId: { type: String, required: true, unique: true },
  items: [cartItemSchema],
  total: { type: Number, required: true, default: 0 },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

export const Cart = model<ICart>("Cart", cartSchema);
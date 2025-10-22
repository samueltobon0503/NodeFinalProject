import { model, Schema } from "mongoose";
import { IOrder } from "../models/IOrder";

const orderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },

  orderNumber: { type: String, required: true, unique: true },

  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      subtotal: { type: Number, required: true },
    },
  ],

  totalAmount: { type: Number, required: true },

  orderStatusId: {
    type: String,
    enum: ["PENDIENTE", "PREPARANDO", "EN_TRANSITO", "EN_ENTREGA", "ENTREGADO", "CANCELADO"],
    default: "PENDIENTE",
  },

  shippingAddressId: { type: Schema.Types.ObjectId, ref: "Address", required: true },

  createdAt: { type: Date, default: new Date() },

  active: { type: Boolean, default: true },
});

export const Order = model<IOrder>("Order", orderSchema);
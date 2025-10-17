import { model, Schema } from "mongoose"
import { IOrder } from "../models/IOrder";

const orderSchema = new Schema<IOrder>({
    userId: { type: String, required: true },
    totalAmount: { type: String, required: true },
    orderStatusId: { type: String, required: true },
    shippingAddressId: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    createdAt: { type: Date, default: new Date() },
    active: { type: Boolean, default: false, required: true },
});

export const Order = model<IOrder>('Order', orderSchema);

import { Types } from "mongoose";

export interface IOrder {
    userId: string,
    totalAmount: string,
    orderStatusId: string,
    shippingAddressId: Types.ObjectId,
    createdAt: Date,
    active: boolean
}


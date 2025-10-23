import { model, Schema } from "mongoose";
import { IShipment } from "../models/IShipment";

const shipmentSchema = new Schema<IShipment>({
    orderId: { type: String, required: true },
    trackingNumber: { type: String, required: true, unique: true },
    carrier: { type: String, required: true },
    statusId: { type: String, required: true },
    shipmentAt: { type: Date, default: () => new Date() },
    deliveryAt: { type: Date },
    updatedAt: { type: Date, default: () => new Date() },
    confirmedByCustomer: { type: Boolean, default: false }
});

export const Shipment = model<IShipment>('Shipment', shipmentSchema);

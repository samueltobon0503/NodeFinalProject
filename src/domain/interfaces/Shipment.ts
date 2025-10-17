import { model, Schema } from "mongoose"
import { IShipment } from "../models/IShipment"

const salesSchema = new Schema<IShipment>({
    orderId : { type: String, required: true },
    trackingNumber : { type: String, required: true },
    carrier : { type: String, required: true },
    statusId : { type: String, required: true},
    shipmentAt : { type: Date , default: new Date() },
    deliveryAt : { type: Date, default: new Date()}
})


export const Shipment = model<IShipment>('Shipment', salesSchema)
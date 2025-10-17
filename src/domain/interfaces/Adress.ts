import { model, Schema } from "mongoose"
import { IAddress } from "../models/IAddress";

const adressSchema = new Schema<IAddress>({
    userId : { type: String, required: true},
    street : { type: String, required: true},
    state : { type: String, required: true},
    postalCode : { type: String, required: true},
    country : { type: String, required: true},
});

export const Address = model<IAddress>('Address', adressSchema);
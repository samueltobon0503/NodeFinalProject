import { model, Schema } from "mongoose"
import { IProductCategory } from "../models/IProductCategory";

const producCategorytSchema = new Schema<IProductCategory>({
    name : { type: String, required: true},
    active : {type: Boolean, required: true}
});

export const ProductCategory = model<IProductCategory>('ProductCategory', producCategorytSchema);

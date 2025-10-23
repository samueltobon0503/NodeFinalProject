import { model, Schema } from "mongoose"
import { IProduct } from "../models/IProduct";

const productSchema = new Schema<IProduct>({
    name : { type: String, required: true},
    description : { type: String, required: true},
    price : { type: String, required: true},
    stock : { type: Number, required: true},
    sku : { type: String, required: true},
    categoryId : { type: String, min: [0, "El stock no puede ser negativo."], required: true},
    imageUrl : { type: String, required: true},
    active: { type: Boolean, default: true },
    createdAt : { type: Date, default: new Date()},
});

export const Product = model<IProduct>('Product', productSchema);

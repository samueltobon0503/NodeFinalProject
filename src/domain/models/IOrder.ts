import { Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface IOrder {
  userId: string;
  orderNumber: string;
  items: IOrderItem[];
  totalAmount: number;
  orderStatusId: "PENDIENTE" | "PREPARANDO" | "EN_TRANSITO" | "EN_ENTREGA" | "ENTREGADO" | "CANCELADO";
  shippingAddressId: Types.ObjectId;
  createdAt: Date;
  active: boolean;
}
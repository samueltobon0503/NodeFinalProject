export interface ICartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
  subtotal: number;
  priceLockedUntil: Date;
}

export interface ICart {
  userId: string;
  items: ICartItem[];
  total: number;
  updatedAt: Date;
  expiresAt: Date;
}
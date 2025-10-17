export interface IOrder {
    userId: string,
    totalAmount: string,
    orderStatusId: string,
    shippingAddressId: string,
    createdAt: Date,
    active: boolean
}


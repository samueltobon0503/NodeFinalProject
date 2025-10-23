export interface IShipment {
    orderId: string,
    trackingNumber: string,
    carrier: string,
    statusId: string,
    shipmentAt: Date,
    deliveryAt?: Date;
    updatedAt?: Date;
    confirmedByCustomer?: boolean;
}

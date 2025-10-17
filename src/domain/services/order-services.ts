import { Order } from "../interfaces/Order";
import { IOrder } from "../models/IOrder";


export const getOrder = async () => {
    try {
        return await Order.find();
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error obteniendo las ordenes");
    }
}

export const saveOrder = async (order: IOrder) => {
    try {
        const newOrder = new Order(order);
        await newOrder.save();
        return newOrder;
    } catch (error) {
        console.error("Error al guardar la orden en MongoDB:", error);
        throw new Error(error.message || "Fallo la creación de una orden");
    }
}

export const updateLOrder = async (orderId: string, updateData: IOrder) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        );
        return updatedOrder;
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error actualizando la orden");
    }
}

export const inactiveLOrder = async (orderId: string) => {
    try {
        const inactiveOrder = await Order.findByIdAndUpdate(
            orderId,
            { active: false }, 
            { new: true }         
        );
        return inactiveOrder;
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error inactivando la orden");
    }
}
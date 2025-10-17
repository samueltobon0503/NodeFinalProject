import { Request, Response } from "express";
import { IOrder } from "../../domain/models/IOrder";
import { getOrder, inactiveLOrder, saveOrder, updateLOrder } from "../../domain/services/order-service";



export const getAllOrder = async (request: Request, response: Response) => {

    try {
        const order = await getOrder();
        response.json({
            ok: true,
            data: order
        })
    } catch (error) {
        console.error(error);
        throw new Error("No se pudo obtener la orden");
    }
}

export const createOrder = async (request: Request, response: Response) => {
    try {
        const { userId, totalAmount, orderStatusId, shippingAddressId } = request.body;
        const newOrder: IOrder = {
            userId: userId,
            totalAmount: totalAmount,
            orderStatusId: orderStatusId,
            shippingAddressId: shippingAddressId,
            createdAt: new Date(),
            active: true,
        }
        const result = await saveOrder(newOrder);
        response.json({
            ok: true,
            staus: 'created',
            data: result
        })
    } catch (error) {
        console.error(error);
        response.status(500).json({
            ok: false,
            message: "Error al crear la orden",
            error: error.message || error
        });
    }

};

export const updateOrder = async (request: Request, response: Response) => {

    try {

        const orderId = request.params.id;
        const { userId, totalAmount, orderStatusId, shippingAddressId, active } = request.body;
        const updateOrder: IOrder = {
            userId: userId,
            totalAmount: totalAmount,
            orderStatusId: orderStatusId,
            shippingAddressId: shippingAddressId,
            createdAt: new Date(),
            active: active,
        }

        const order = await updateLOrder(orderId, updateOrder);
        if (!order) {
            return response.status(404).json({
                ok: false,
                message: `orden con ID ${orderId} no encontrado.`
            });
        }
        response.json({
            ok: true,
            data: order
        })
    } catch (error) {
        response.status(500).json({
            ok: false,
            message: "Error al actualizar la orden",
            error: error.message || error
        });
    }

};

export const inactiveOrder = async (request: Request, response: Response) => {

    try {
        const orderId = request.params.id;
        const order = await inactiveLOrder(orderId);

        response.json({
            ok: true,
            data: order
        })
    } catch (error) {
        response.status(404).json({
            ok: false,
            message: "Error al desactivar la orden",
            error: error.message || error
        });
    }

};
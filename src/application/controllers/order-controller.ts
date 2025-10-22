import { Request, Response } from "express";
import { IOrder } from "../../domain/models/IOrder";
import { createOrderFromCheckout, getOrder, getOrderStatus, inactiveLOrder, updateOrderStatus } from "../../domain/services/order-service";
import { AuthRequest } from "../../infraestructure/auth/jwt-service";



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

export const getOrderStatusController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, message: "Usuario no autenticado" });

    const { orderId } = req.params;
    const result = await getOrderStatus(userId, orderId);

    return res.status(200).json({ ok: true, data: result });
  } catch (error: any) {
    console.error(error);
    const status = error.status || 400;
    return res.status(status).json({ ok: false, message: error.message || "Error obteniendo estado" });
  }
};

export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.body;
    const order = await createOrderFromCheckout(userId,addressId);
    res.json({
      ok: true,
      message: "Orden creada exitosamente",
      data: order,
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ ok: false, message: error.message || "Error al crear la orden" });
  }
};

export const changeOrderStatusController = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { newStatus } = req.body;

    if (!newStatus) {
      return res.status(400).json({ ok: false, message: "newStatus es requerido en el body" });
    }

    const updatedOrder = await updateOrderStatus(orderId, newStatus);

    return res.status(200).json({
      ok: true,
      message: `Estado actualizado a ${newStatus}`,
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error(error);
    const status = error.status || 400;
    return res.status(status).json({ ok: false, message: error.message || "Error cambiando estado" });
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
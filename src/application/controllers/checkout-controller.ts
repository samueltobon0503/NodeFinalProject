import { confirmCartBeforeCheckout, validateShippingInfo } from "../../domain/services/checkout-service";
import { Request, Response } from "express";
import { AuthRequest } from "../../infraestructure/auth/jwt-service";

export const confirmCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await confirmCartBeforeCheckout(userId!);

    res.json({
      ok: true,
      message: "Confirmación de carrito lista para checkout",
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      message: error.message || "Error al confirmar el carrito"
    });
  }
};

export const confirmShippingInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { addressId, shippingMethod } = req.body;

    const result = await validateShippingInfo(userId, addressId, shippingMethod);

    res.status(200).json({
      ok: true,
      message: "Información de envío validada correctamente",
      data: result,
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      ok: false,
      message: error.message || "Error al validar la información de envío",
    });
  }
};

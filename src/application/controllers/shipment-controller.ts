import { Request, Response } from "express";
import { IShipment } from "../../domain/models/IShipment";
import { getShipment, deleteLShipment, assignShipment } from "../../domain/services/shipment-service";

export const getAllShipment = async (request : Request, response: Response ) => {

        try {
        const shipment = await getShipment();
        response.json({
            ok: true,
            data: shipment
        })
    } catch (error) {
        console.error(error);
        throw new Error("No se pudo obtener el envio");
    }
} 

export const assignShipmentController = async (req: Request, res: Response) => {
  try {
    const { orderId, carrier } = req.body;

    if (!orderId || !carrier) {
      return res.status(400).json({
        ok: false,
        message: "orderId y carrier son requeridos",
      });
    }

    const shipment = await assignShipment(orderId, carrier);

    res.status(201).json({
      ok: true,
      message: "Transportadora y número de guía asignados correctamente",
      data: shipment,
    });
  } catch (error: any) {
    console.error("Error en assignShipmentController:", error);
    res.status(500).json({
      ok: false,
      message: error.message || "Error al asignar transportadora",
    });
  }
};

export const deleteShipment = async (request: Request, response: Response) => {

    try {
        const shipmentId = request.params.id;

        if(!shipmentId) {
            return response.status(400).json({
                ok:false,
                message: "El id no es valido"
            });
        }
        const shipment = await deleteLShipment(shipmentId);
        return response.json({
            ok: true,
            data: shipment
        })
    } catch (error) {
        response.status(404).json({
            ok: false,
            message: "Error al eliminar el envio",
            error: error.message || error
        });
    }

};
import { Request, Response } from "express";
import { IShipment } from "../../domain/models/IShipment";
import { getShipment, deleteLShipment, saveShipment, updateLShipment } from "../../domain/services/shipment-service";



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

export const createShipment = async (request: Request, response: Response) => {
    try {
        const { orderId, trackingNumber,carrier, statusId } = request.body;
        const newShipment: IShipment = {
            orderId: orderId,
            trackingNumber: trackingNumber,
            carrier: carrier,
            statusId: statusId,
            shipmentAt: new Date(),
            deliveryAt: new Date()
        }
        const result = await saveShipment(newShipment);
        response.json({
            ok: true,
            staus: 'created',
            data: result
        })
    } catch (error) {
        console.error(error);
        response.status(500).json({
            ok: false,
            message: "Error al crear el envio",
            error: error.message || error
        });
    }

};

export const updateShipment = async (request: Request, response: Response) => {

    try {

        const shipmentId = request.params.id;
        const { orderId, trackingNumber, carrier, statusId } = request.body;
        const updateShipment: IShipment = {
            orderId: orderId,
            trackingNumber: trackingNumber,
            carrier: carrier,
            statusId: statusId,
            shipmentAt: new Date(),
            deliveryAt: new Date()
        }

        const shipment = await updateLShipment(shipmentId, updateShipment);
        if (!shipment) {
            return response.status(404).json({
                ok: false,
                message: `envio con ID ${shipmentId} no encontrado.`
            });
        }
        response.json({
            ok: true,
            data: shipment
        })
    } catch (error) {
        response.status(500).json({
            ok: false,
            message: "Error al actualizar el envio",
            error: error.message || error
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
        response.status(500).json({
            ok: false,
            message: "Error al eliminar el envio",
            error: error.message || error
        });
    }

};
import { Order } from "../interfaces/Order";
import { Shipment } from "../interfaces/Shipment";
import { IShipment } from "../models/IShipment";
import crypto from "crypto";

const shipmentFlow = ["CREATED", "EN_TRANSITO", "EN_ENTREGA", "ENTREGADO"];

export const getShipment = async () => {
    try {
        return await Shipment.find();
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error obteniendo los envios");
    }
}

export const assignShipment = async (orderId: string, carrier: string) => {
    try {
        const existing = await Shipment.findOne({ orderId });
        if (existing) throw new Error("La orden ya tiene un envío asignado");

        const order = await Order.findOne({ _id: orderId });
        if (!order) throw new Error("La orden no existe.");

        let trackingNumber: string;
        let exists = true;
        do {
            trackingNumber = `${carrier.toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
            const duplicate = await Shipment.findOne({ trackingNumber });
            if (!duplicate) exists = false;
        } while (exists);

        const shipment: IShipment = {
            orderId,
            trackingNumber,
            carrier,
            statusId: "CREATED",
            shipmentAt: new Date(),
        };

        const newShipment = new Shipment(shipment);
        await newShipment.save();

        return newShipment;
    } catch (error: any) {
        console.error("Error asignando transportadora:", error);
        throw new Error(error.message || "Error al asignar transportadora");
    }
};

export const updateShipmentStatus = async (shipmentId: string, newStatus: string, proof: boolean) => {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) throw new Error("Shipment no encontrado");

    const currentIndex = shipmentFlow.indexOf(shipment.statusId);
    const newIndex = shipmentFlow.indexOf(newStatus);

    if (newIndex === -1) throw new Error("Estado inválido");
    if (newIndex !== currentIndex + 1) throw new Error("Solo se puede avanzar al siguiente estado secuencial");

    if (newStatus === "ENTREGADO") {
        if (!proof)
            throw new Error("El estado ENTREGADO requiere confirmación del cliente");
        shipment.confirmedByCustomer = proof || false;
        shipment.deliveryAt = new Date();
    }

    shipment.statusId = newStatus;
    shipment.updatedAt = new Date();

    await shipment.save();

    return shipment;
};

export const deleteLShipment = async (shipmentId: string) => {
    try {
        const deleteShipment = await Shipment.deleteOne({ _id: shipmentId });

        if (deleteShipment.deletedCount === 0) {
            throw new Error('No se encontro ningun envio con el id para eliminar el envio');
        }
        return { message: "Envio eliminado correctamente", deleteLShipment };
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error eliminando el envio");
    }
}
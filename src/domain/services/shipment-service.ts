import { Shipment } from "../interfaces/Shipment";
import { IShipment } from "../models/IShipment";

export const getShipment = async () => {
    try {
        return await Shipment.find();
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error obteniendo los envios");
    }
}

export const saveShipment = async (shipment: IShipment) => {
    try {
        const newShipment = new Shipment(shipment);
        await newShipment.save();
        return newShipment;
    } catch (error) {
        console.error("Error al guardar el sale en MongoDB:", error);
        throw new Error(error.message || "Fallo la creación de un envio");
    }
}

export const updateLShipment = async (shipmentId: string, updateData: IShipment) => {
    try {
        const updatedShipment = await Shipment.findByIdAndUpdate(
            shipmentId,
            updateData,
            { new: true }
        );
        return updatedShipment;
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error actualizando el envio");
    }
}

export const deleteLShipment = async (shipmentId: string) => {
    try {
        const deleteShipment = await Shipment.deleteOne({_id :shipmentId});

        if(deleteShipment.deletedCount === 0){
            throw new Error('No se encontro ningun envio con el id para eliminar el envio'); 
        }
        return {message: "Envio eliminado correctamente", deleteLShipment};
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error eliminando el envio");
    }
}
import { Address } from "../interfaces/Adress";
import { IAddress } from "../models/IAddress";

export const saveAddress = async (address: IAddress) => {
    try {
        const newAddress = new Address(address);
        return await newAddress.save();
    } catch (error) {
        console.error("Error al guardar la direccion en la base de datos:", error);
        throw new Error(error.message || "Fallo la creación de la dirección");
    }
}
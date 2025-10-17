import { Request, Response } from "express";
import { saveAddress } from "../../domain/services/address-service";
import { IAddress } from "../../domain/models/IAddress";


export const createAddress = async (request: Request, response: Response) => {
    try {
        const { userId, street, postalCode, state, city, country } = request.body;

        const newAddress: IAddress = {
            userId: userId,
            street: street,
            city: city,
            state: state,
            postalCode: postalCode,
            country: country,
        }
        const result = await saveAddress(newAddress);
        response.json({
            ok: true,
            staus: 'created',
            data: result
        })
    } catch (error) {
        console.error(error);
        response.status(500).json({
            ok: false,
            message: "Error al crear la direccion",
            error: error.message || error
        });
    }
};

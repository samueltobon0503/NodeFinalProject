import { Request, Response } from "express";
import { getAddressByUserId, saveAddress } from "../../domain/services/address-service";
import { IAddress } from "../../domain/models/IAddress";
import { AuthRequest } from "../../infraestructure/auth/jwt-service";

export const getAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const address = await getAddressByUserId(userId);
    if (!address) {
      return res.status(200).json({ ok: true, message: "Aun no has creado tu dirección", data: [] });
    }

    res.json({ ok: true, data: address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error obteniendo el carrito" });
  }
};


export const createAddress = async (request: Request, response: Response) => {
    try {
        const { userId, street, postalCode, state, city, country } = request.body;

        if (!isValidPostalCode(postalCode)) {
            return response.status(400).json({
                ok: false,
                message: "El código postal no es válido. Debe tener 6 dígitos numéricos y no empezar con 0.",
            });
        }

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
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            ok: false,
            message: "Error al crear la direccion",
            error: error.message || error
        });
    }
};

export const isValidPostalCode = (postalCode: string): boolean => {
  const regex = /^[1-9][0-9]{5}$/;
  return regex.test(postalCode);
};
import { generateToken, JWTPayload } from './../../infraestructure/auth/jwt-service';
import { Request, Response } from "express";

const user = {
    email: "samuel@gmail.com",
    password: "12345"
}

interface LoginRequestParams {
    email: string,
    password: string
}

export const login = async (request: Request, response: Response) => {

    try {
        const { email, password } = request.body;

        if (email !== user.email) {
            return response.status(422).json({
                error: "Error en las credenciales, verifica antes!"
            });
        }

        if (password !== user.password) {
            return response.status(422).json({
                error: "Error en las credenciales, verifica antes!"
            });
        }

        const payload: JWTPayload = {
            id: "1",
            email: email,
            role: "admin"
        }

        const token = generateToken(payload)

        return response.status(200).json({
            ok: true,
            data: token
        });
    } catch (error) {
        console.error(error);
        throw new Error("No se pudo obtener el usuario");
    }

};

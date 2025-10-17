import { getUserByEmail } from '../../domain/services/user-service';
import { generateToken, JWTPayload } from './../../infraestructure/auth/jwt-service';
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

export const login = async (request: Request, response: Response) => {

    try {
        const { email, password } = request.body;

        const user = await getUserByEmail(email);

        if (!user) {
            return response.status(422).json({
                ok: false,
                error: "Usuario no encontrado"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return response.status(422).json({
                ok: false,
                error: "Credenciales incorrectas"
            });
        }

        const payload: JWTPayload = {
            id: user.id,
            email: user.email,
            role: user.isAdmin ? "admin" : "user"
        };

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

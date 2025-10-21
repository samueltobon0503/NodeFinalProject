import { getUserByEmail, updateLUser } from '../../domain/services/user-service';
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

        if (user.lockUntil && user.lockUntil > new Date()) {
            const minutosRestantes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
            return response.status(403).json({
                ok: false,
                error: `Cuenta bloqueada temporalmente. Intenta nuevamente en ${minutosRestantes} minuto(s).`
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            user.failedAttempts = (user.failedAttempts || 0) + 1;

            if (user.failedAttempts >= 3) {
                user.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
                user.failedAttempts = 0;
            }

            await updateLUser(user.id, user);

            return response.status(422).json({
                ok: false,
                error: "Credenciales incorrectas"
            });
        }

        user.failedAttempts = 0;
        user.lockUntil = null;
        await updateLUser(user.id, user);

        const payload: JWTPayload = {
            id: user.id,
            email: user.email,
            role: user.isAdmin ? "admin" : "user"
        };

        const token = generateToken(payload);

        return response.status(200).json({
            ok: true,
            data: token
        });

    } catch (error: any) {
        console.error(error);
        return response.status(500).json({
            ok: false,
            error: "Error interno al procesar el login",
            details: error.message || error
        });
    }
};
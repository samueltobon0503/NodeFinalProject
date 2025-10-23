import { Request, Response } from "express";
import { IUser } from "../../domain/models/IUser";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getUserByEmail, getUsers, inactiveLUser, saveUser, updateLUser, verifyUserEmail } from "../../domain/services/user-service";
import { sendEmail } from "../../infraestructure/emails/email.service";

export const getAllUsers = async (request: Request, response: Response) => {

    try {
        const users = await getUsers();
        response.json({
            ok: true,
            data: users
        })
    } catch (error) {
        console.error(error);
        throw new Error("No se pudo obtener el usuario");
    }
};

export const createUser = async (request: Request, response: Response) => {
    try {
        const { name, lastName, email, password, userName, phone } = request.body;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            return response.status(400).json({
                ok: false,
                error: "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números."
            });
        }

        const user = await getUserByEmail(email);

        if (user) {
            return response.status(422).json({
                ok: false,
                error: "El usuario ya existe"
            });
        }

        if (!isValidColombianPhone(phone)) {
            return response.status(400).json({
                ok: false,
                message: "El número de teléfono no tiene un formato colombiano válido (+57 y 10 dígitos).",
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const newUser: IUser = {
            name: name,
            lastName: lastName,
            createdAt: new Date(),
            email: email,
            userName: userName,
            isAdmin: false,
            phone: phone,
            active: true,
            password: hashedPassword,
            verified: false,
            verificationToken,
        }

        const result = await saveUser(newUser);
        const verificationUrl = `http://localhost:4000/api/auth/verify-email?token=${verificationToken}`;

        await sendEmail(
            email,
            "Bienvenido a Aliestres",
            `<h2>Hola ${name} ${lastName}</h2>
        <p>Gracias por registrarte. Por favor confirma tu correo haciendo clic en el siguiente enlace:</p>
        <a href="${verificationUrl}">Verificar mi cuenta</a>`
        );

        response.json({
            ok: true,
            staus: 'created',
            data: `Usuario ${name} ${lastName} creado exitosamente`
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            ok: false,
            message: "Error al crear el usuario",
            error: error.message || error
        });
    }

};

export const inactiveUser = async (request: Request, response: Response) => {

    try {
        const userId = request.params.id;
        const user = await inactiveLUser(userId);

        response.json({
            ok: true,
            data: user
        })
    } catch (error) {
        response.status(500).json({
            ok: false,
            message: "Error al desactivar el usuario",
            error: error.message || error
        });
    }

};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        const user = await verifyUserEmail(token as string);

        if (!user) {
            return res.status(400).json({ ok: false, message: "Token inválido o expirado" });
        }

        user.verified = true;
        user.verificationToken = undefined;
        await updateLUser(user.id, user);

        res.json({ ok: true, message: "Correo verificado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "Error al verificar el correo" });
    }
};

export const isValidColombianPhone = (phone: string): boolean => {
    const regex = /^(?:\+57)?[0-9]{10}$/;
    return regex.test(phone);
};
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { IUser } from "../../domain/models/IUser";
import { getUsers, saveUser } from "../../domain/services/user-service";

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
        const { name, lastName, email, userName } = request.body;
        const newUser: IUser = {
            name: name,
            lastName: lastName,
            createdAt: new Date(),
            id: uuidv4(),
            email: email,
            userName: userName,
            isAdmin: false
        }
        const result = await saveUser(newUser);
        response.json({
            ok: true,
            staus: 'created',
            data: result
        })
    } catch (error) {
        console.error(error);
        response.status(500).json({
            ok: false,
            message: "Error al crear el usuario",
            error: error.message || error
        });
    }

};
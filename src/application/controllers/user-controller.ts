import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { IUser } from "../../domain/models/IUser";
import { getUsers, inactiveLUser, saveUser, updateLUser } from "../../domain/services/user-service";

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
            email: email,
            userName: userName,
            isAdmin: false,
            active: true
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

export const updateUser = async (request: Request, response: Response) => {

    try {

        const userId = request.params.id;
        const { name, lastName, email, userName, isAdmin, creatdAt, active } = request.body;
        const updateUser: IUser = {
            name: name,
            lastName: lastName,
            createdAt: creatdAt,
            email: email,
            userName: userName,
            isAdmin: isAdmin,
            active: active
        }

        const user = await updateLUser(userId, updateUser);
        if (!user) {
            return response.status(404).json({
                ok: false,
                message: `Usuario con ID ${userId} no encontrado.`
            });
        }
        response.json({
            ok: true,
            data: user
        })
    } catch (error) {
        response.status(500).json({
            ok: false,
            message: "Error al actualizar el usuario",
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
            message: "Error al actualizar el usuario",
            error: error.message || error
        });
    }

};
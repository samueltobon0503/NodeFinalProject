import { User } from "../interfaces/User";
import { IUser } from "../models/IUser";

export const getUsers = async () => {
    try {
        return await User.find();
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error obteniendo los usuarios");
    }
}

export const getUserByEmail = async (email:string) => {
    try {
        return await User.findOne({ email });
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error obteniendo el usuario");
    }
}

export const getUserById = async (id:string) => {
    try {
        return await User.findOne({ id });
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error obteniendo el usuario");
    }
}

export const saveUser = async (user: IUser) => {
    try {
        const newUser = new User(user);
        await newUser.save();
        return newUser;
    } catch (error) {
        console.error("Error al guardar el usuario en MongoDB:", error);
        throw new Error(error.message || "Fallo la creación de usuario");
    }
}

export const updateLUser = async (userId: string, updateData: IUser) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );
        return updatedUser;
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error actualizando el usuario");
    }
}

export const inactiveLUser = async (userId: string) => {
    try {
        const inactiveUser = await User.findByIdAndUpdate(
            userId,
            { active: false }, 
            { new: true }         
        );
        return inactiveUser;
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error inactivando el usuario");
    }
}

export const verifyUserEmail = async (token: string) => {
  try {
    const user = await User.findOne({ verificationToken: token });
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Error al verificar el token del correo");
  }
};
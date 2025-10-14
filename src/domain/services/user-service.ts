import { User } from "../interfaces/User";
import { IUser } from "../models/IUser";

export const getUsers = async () => {
    try {
        return await User.find();
    } catch (error) {
        console.error(error);
        throw new Error("Se cagó obteniendo todos");
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
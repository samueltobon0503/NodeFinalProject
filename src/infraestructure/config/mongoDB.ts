import mongoose from "mongoose";

const MONGOATLAS_URL: string = 'mongodb+srv://BD_Admins:Facebook123@cluster0.qwusdpw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME: string = '';

export const dbConnection = async () => {
    try {
        await mongoose.connect(`${MONGOATLAS_URL}/${DB_NAME}`);
        console.log("Is online putos")
    } catch (error) {
        console.error(error);
        throw new Error("Se cagó la conexión de la db");
    }
}


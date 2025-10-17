import dotenv from 'dotenv';
dotenv.config()
import express, { Application } from "express";
import appRouter from "./application/routes/app-routes";
import { dbConnection } from "./infraestructure/config/mongoDB";

dbConnection();

const PORT:number = 4000;
const app : Application = express();

app.use (express.json());
app.use('/api', appRouter)

app.listen(PORT, () => {
    console.log(`Server running... at port ${PORT}`)
})
import dotenv from 'dotenv';
dotenv.config()
import express, { Application } from "express";
import appRouter from "./application/routes/app-routes";
import { dbConnection } from "./infraestructure/config/mongoDB";
import cron from "node-cron";
import { autoCancelPendingOrders } from './domain/cron/autoCancelPendingOrders';
import { markLostShipments } from './domain/cron/markLostShipments';

dbConnection();
const PORT:number = 4000;
const app : Application = express();

cron.schedule("0 * * * *", async () => {
  console.log("Ejecutando cron de cancelacion de ordenes no procesadas.....");
  await autoCancelPendingOrders();
});

cron.schedule("0 0 * * *", async () => {
  console.log("Ejecutando tarea automática de revisión de envíos antiguos...");
  await markLostShipments();
});

app.use (express.json());

app.use('/api', appRouter)

app.listen(PORT, () => {
    console.log(`Server running... at port ${PORT}`)
})
import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import appRouter from "./application/routes/app-routes";
import { dbConnection } from "./infraestructure/config/mongoDB";
import cron from "node-cron";
import { autoCancelPendingOrders } from './domain/cron/autoCancelPendingOrders';
import { markLostShipments } from './domain/cron/markLostShipments';
import http from "http";
import { Server } from "socket.io";

dbConnection();

const PORT: number = 4000;
const app: Application = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const connectedUsers = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("registerUser", (userId: string) => {
    connectedUsers.set(userId, socket.id);
    console.log(`Usuario ${userId} registrado con socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, id] of connectedUsers.entries()) {
      if (id === socket.id) {
        connectedUsers.delete(userId);
        console.log(`Usuario ${userId} desconectado`);
        break;
      }
    }
  });
});

export const notifyUser = (userId: string, payload: any) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit("orderStatusChanged", payload);
  }
};


cron.schedule("0 * * * *", async () => {
  console.log("Ejecutando cron de cancelacion de ordenes no procesadas.....");
  await autoCancelPendingOrders();
});

cron.schedule("0 0 * * *", async () => {
  console.log("Ejecutando tarea automática de revisión de envíos antiguos...");
  await markLostShipments();
});

app.use(cors());
app.use(express.json());
app.use('/api', appRouter);

server.listen(PORT, () => {
  console.log(`Server running... at port ${PORT}`);
});

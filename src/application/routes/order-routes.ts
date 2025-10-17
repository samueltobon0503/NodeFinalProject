import express, { Router } from "express";
import { getAllOrder, createOrder, updateOrder, inactiveOrder } from "../controllers/order-controller";
import { verifyAuthToken } from "../middlewares/jwt-verification";

const orderRouter: Router = express.Router();

orderRouter.get('/order', getAllOrder);

orderRouter.post('/order', createOrder);

orderRouter.put('/order/:id', updateOrder);

orderRouter.put('/order/inactive/:id', inactiveOrder);


export default orderRouter;


import express, { Router } from "express";
import { getAllOrder, createOrder, updateOrder, inactiveOrder } from "../controllers/order-controller";
import { verifyAuthToken } from "../middlewares/jwt-verification";
import { verifyUserEmailConfirmed } from "../middlewares/email-verification";


const orderRouter: Router = express.Router();

orderRouter.get('/order', verifyAuthToken, getAllOrder);

orderRouter.post('/order', verifyAuthToken, verifyUserEmailConfirmed, createOrder);

orderRouter.put('/order/:id', verifyAuthToken, updateOrder);

orderRouter.put('/order/inactive/:id', verifyAuthToken, inactiveOrder);


export default orderRouter;


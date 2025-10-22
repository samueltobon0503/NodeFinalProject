import express, { Router } from "express";
import { changeOrderStatusController, getAllOrder, getOrderStatusController, inactiveOrder, placeOrder } from "../controllers/order-controller";
import { verifyAuthToken } from "../middlewares/jwt-verification";
import { verifyUserEmailConfirmed } from "../middlewares/email-verification";


const orderRouter: Router = express.Router();

orderRouter.get('/order', verifyAuthToken, getAllOrder);

orderRouter.get("/order/:orderId/tracking", verifyAuthToken, getOrderStatusController);

orderRouter.patch("/order/:orderId/status", verifyAuthToken, changeOrderStatusController);

orderRouter.post('/order', verifyAuthToken, verifyUserEmailConfirmed, placeOrder);

orderRouter.put('/order/inactive/:id', verifyAuthToken, inactiveOrder);


export default orderRouter;


import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/jwt-verification";
import { confirmCheckout, confirmShippingInfo } from "../controllers/checkout-controller";

const checkoutRouter: Router = express.Router();

checkoutRouter.get("/checkout/confirm", verifyAuthToken, confirmCheckout);

checkoutRouter.post("/checkout/shipping", verifyAuthToken, confirmShippingInfo);


export default checkoutRouter;
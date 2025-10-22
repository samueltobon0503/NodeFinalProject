import { Router } from "express";
import { verifyAuthToken } from "../middlewares/jwt-verification";
import { addProductToCart, getCart, removeProductFromCart, updateCartQuantity } from "../controllers/cart-controller";

const cartRouter = Router();

cartRouter.get("/cart", verifyAuthToken, getCart);

cartRouter.post("/cart/add", verifyAuthToken, addProductToCart);

cartRouter.put("/cart/update", verifyAuthToken, updateCartQuantity);

cartRouter.delete("/cart/:productId", verifyAuthToken, removeProductFromCart);

export default cartRouter;
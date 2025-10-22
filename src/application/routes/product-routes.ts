import express, { Router } from "express";
import { createProduct, getAllProduct, deleteProduct, updateProduct, getAllProductAdmin } from "../controllers/product-controller";
import { verifyAuthToken } from "../middlewares/jwt-verification";
import { verifyRole } from "../middlewares/role-verification";

const productRouter: Router = express.Router();

productRouter.get('/product', verifyAuthToken, getAllProduct);

productRouter.get('/product/admin', verifyAuthToken, verifyRole("admin"), getAllProductAdmin);

productRouter.post('/product', verifyAuthToken, verifyRole("admin"), createProduct);

productRouter.put('/product/:id', verifyAuthToken, verifyRole("admin"), updateProduct);

productRouter.delete('/product/delete/:id', verifyAuthToken, verifyRole("admin"), deleteProduct);


export default productRouter;


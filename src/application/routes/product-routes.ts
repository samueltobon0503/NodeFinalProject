import express, { Router } from "express";
import { createProduct, getAllProduct, deleteProduct, updateProduct, getAllProductAdmin } from "../controllers/product-controller";
import { verifyAuthToken } from "../middlewares/jwt-verification";
import { verifyRole } from "../middlewares/role-verification";

const productRouter: Router = express.Router();

productRouter.get('/product', verifyAuthToken, getAllProduct);

productRouter.get('/product/admin', verifyAuthToken, verifyRole("admin"), getAllProductAdmin);

productRouter.post('/product', verifyAuthToken, createProduct);

productRouter.put('/product/:id', verifyAuthToken, updateProduct);

productRouter.delete('/product/delete/:id', verifyAuthToken, deleteProduct);


export default productRouter;


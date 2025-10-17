import express, { Router } from "express";
import { createProduct, getAllProduct, deleteProduct, updateProduct } from "../controllers/product-controller";
import { verifyAuthToken } from "../middlewares/jwt-verification";

const productRouter: Router = express.Router();

productRouter.get('/product', verifyAuthToken, getAllProduct);

productRouter.post('/product', verifyAuthToken, createProduct);

productRouter.put('/product/:id', verifyAuthToken, updateProduct);

productRouter.delete('/product/delete/:id', verifyAuthToken, deleteProduct);


export default productRouter;


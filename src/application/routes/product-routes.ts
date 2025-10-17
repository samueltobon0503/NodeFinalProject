import express, { Router } from "express";
import { createProduct, getAllProduct, deleteProduct, updateProduct } from "../controllers/product-controller";
import { verifyAuthToken } from "../middlewares/jwt-verification";

const productRouter: Router = express.Router();

productRouter.get('/product', getAllProduct);

productRouter.post('/product', createProduct);

productRouter.put('/product/:id', updateProduct);

productRouter.delete('/product/delete/:id', deleteProduct);


export default productRouter;


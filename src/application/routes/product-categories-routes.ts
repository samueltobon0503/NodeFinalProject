import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/jwt-verification";
import { verifyRole } from "../middlewares/role-verification";
import { createProductCategory, getAllProductCategories } from "../controllers/product-category-controller";

const productCategoryRouter: Router = express.Router();

productCategoryRouter.get('/productCategory', verifyAuthToken, getAllProductCategories);

productCategoryRouter.post('/productCategory', verifyAuthToken, verifyRole("admin"), createProductCategory);

productCategoryRouter.put('/productCategory/:id', verifyAuthToken, getAllProductCategories);

productCategoryRouter.delete('/productCategory/delete/:id', verifyAuthToken, getAllProductCategories);

export default productCategoryRouter;


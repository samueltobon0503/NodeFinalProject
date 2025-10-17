import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/jwt-verification";
import { createAddress } from "../controllers/address-controller";

const addressRouter: Router = express.Router();

addressRouter.post('/address', createAddress);

addressRouter.delete('/address/delete/:id', createAddress);

export default addressRouter;
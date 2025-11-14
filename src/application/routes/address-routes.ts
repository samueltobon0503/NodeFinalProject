import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/jwt-verification";
import { createAddress, getAddress } from "../controllers/address-controller";

const addressRouter: Router = express.Router();

addressRouter.get('/address', verifyAuthToken, getAddress);

addressRouter.post('/address', verifyAuthToken, createAddress);

addressRouter.delete('/address/delete/:id', verifyAuthToken, createAddress);

export default addressRouter;
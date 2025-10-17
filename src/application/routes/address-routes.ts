import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/jwt-verification";
import { createAddress } from "../controllers/address-controller";

const addressRouter: Router = express.Router();

addressRouter.post('/address', verifyAuthToken, createAddress);

addressRouter.delete('/address/delete/:id', verifyAuthToken, createAddress);

export default addressRouter;
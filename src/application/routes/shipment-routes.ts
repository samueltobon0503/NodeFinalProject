import express, { Router } from "express";
import { createShipment, getAllShipment, deleteShipment, updateShipment } from "../controllers/shipment-controller";
import { verifyAuthToken } from "../middlewares/jwt-verification";

const shipmentRouter: Router = express.Router();

shipmentRouter.get('/shipment', verifyAuthToken, getAllShipment);

shipmentRouter.post('/shipment', verifyAuthToken, createShipment);

shipmentRouter.put('/shipment/:id', verifyAuthToken, updateShipment);

shipmentRouter.delete('/shipment/delete/:id', verifyAuthToken, deleteShipment);

export default shipmentRouter;
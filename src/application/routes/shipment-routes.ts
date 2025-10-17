import express, { Router } from "express";
import { createShipment, getAllShipment, deleteShipment, updateShipment } from "../controllers/shipment-controller";
import { verifyAuthToken } from "../middlewares/jwt-verification";

const shipmentRouter: Router = express.Router();

shipmentRouter.get('/shipment', getAllShipment);

shipmentRouter.post('/shipment', createShipment);

shipmentRouter.put('/shipment/:id', updateShipment);

shipmentRouter.delete('/shipment/delete/:id', deleteShipment);

export default shipmentRouter;
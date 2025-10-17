import { Request, Response, Router } from "express";
import userRouter from "./users-routes";
import authRouter from "./auth-routes";
import shipmentRouter from "./shipment-routes";
import productRouter from "./product-routes";

const appRouter: Router = Router();

appRouter.get('/', (req: Request, res: Response) =>{
    res.status(200).json({
        ok: true,
        message: 'This is the app router'
    });
});

appRouter.use('/', userRouter);
appRouter.use('/', authRouter);
appRouter.use('/', shipmentRouter);
appRouter.use('/', productRouter);

export default appRouter;
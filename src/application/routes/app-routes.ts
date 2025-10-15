import { Request, Response, Router } from "express";
import userRouter from "./users-routes";
import authRouter from "./auth-routes";

const appRouter: Router = Router();

appRouter.get('/', (req: Request, res: Response) =>{
    res.status(200).json({
        ok: true,
        message: 'This is the app router'
    });
});

appRouter.use('/', userRouter);
appRouter.use('/', authRouter);

export default appRouter;
import express, { Router, Request, Response } from "express";
import { createUser, getAllUsers } from "../controllers/user-controller";

const userRouter: Router = express.Router();

userRouter.get('/user', getAllUsers);

userRouter.post('/user', createUser);

export default userRouter;
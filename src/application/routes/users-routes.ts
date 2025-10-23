import express, { Router } from "express";
import { createUser, getAllUsers, inactiveUser } from "../controllers/user-controller";
import { verifyAuthToken } from "../middlewares/jwt-verification";

const userRouter: Router = express.Router();

userRouter.get('/user', verifyAuthToken, getAllUsers);

userRouter.post('/user', createUser);

userRouter.put('/user/inactive/:id', verifyAuthToken, inactiveUser);

export default userRouter;
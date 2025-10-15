import express, { Router } from "express";
import { createUser, getAllUsers, inactiveUser, updateUser } from "../controllers/user-controller";

const userRouter: Router = express.Router();

userRouter.get('/user', getAllUsers);

userRouter.post('/user', createUser);

userRouter.put('/user/:id', updateUser);

userRouter.put('/user/inactive/:id', inactiveUser);


export default userRouter;
import express, { Router } from "express";
import { login } from "../controllers/auth-controller";

const authRouter: Router = express.Router();

authRouter.post('/auth/login', login);

export default authRouter;
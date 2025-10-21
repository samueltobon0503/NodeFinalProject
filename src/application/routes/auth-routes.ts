import express, { Router } from "express";
import { login } from "../controllers/auth-controller";
import { verifyEmail } from "../controllers/user-controller";

const authRouter: Router = express.Router();

authRouter.post('/auth/login', login);

authRouter.get("/auth/verify-email", verifyEmail);

export default authRouter;
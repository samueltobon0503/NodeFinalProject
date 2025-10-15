import { NextFunction, Request, Response } from "express";
import { JWTPayload, verifyToken } from "../../infraestructure/auth/jwt-service";


export const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
    const headerToken = req.headers['authorization'];

    try {
        const decodedpayload: JWTPayload = verifyToken(headerToken);
        console.log(decodedpayload)

    } catch (error) {
        res.status(401).json({
            ok: false,
            message: "No autorizado",
            error: error.message || error
        });
    }

    next();
}
import { NextFunction, Request, Response } from "express";
import { AuthRequest, JWTPayload, verifyToken } from "../../infraestructure/auth/jwt-service";


export const verifyAuthToken = (req, res, next) => {
    const headerToken = req.headers['authorization'];

    try {
        const decodedpayload: JWTPayload = verifyToken(headerToken);
         (req as AuthRequest).user = decodedpayload;

    } catch (error) {
        res.status(401).json({
            ok: false,
            message: "No autorizado",
            error: error.message || error
        });
    }

    next();
}
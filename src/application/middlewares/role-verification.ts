import { NextFunction, RequestHandler, Response } from "express";
import { AuthRequest } from "../../infraestructure/auth/jwt-service";

export const verifyRole = (...allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    const userRole = ((req as unknown) as AuthRequest).user?.role;

    if (!userRole) {
      return res.status(401).json({
        ok: false,
        message: "No autorizado: usuario sin rol asignado"
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        ok: false,
        message: "Acceso denegado: rol no permitido"
      });
    }

    next();
  };
};

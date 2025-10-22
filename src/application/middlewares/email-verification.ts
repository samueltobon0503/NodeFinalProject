import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../infraestructure/auth/jwt-service"; // tu tipo extendido
import { getUserById } from "../../domain/services/user-service";

export const verifyUserEmailConfirmed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = ((req as unknown) as AuthRequest).user?.id;
    console.log("usuario", userId)
    const user = await getUserById(userId);

    console.log("usuarioi", user)
    if (!user?.verified) {
      return res.status(403).json({
        ok: false,
        message: "Debes verificar tu correo antes de realizar esta acción.",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ ok: false, message: "Error verificando estado del usuario" });
  }
};

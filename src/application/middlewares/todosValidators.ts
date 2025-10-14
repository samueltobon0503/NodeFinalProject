import { NextFunction, Request, Response } from "express";


export const todoParamsValidation = (req: Request, res: Response, next: NextFunction) => {
    const { title, body, idDone, createdAt } = req.body;

    // if (!createdAt) {
    //     return res.status(422);
    // }
    next();
}
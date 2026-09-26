import { AppError } from "@domain/errors/AppError.js";
import {type Request,type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TOKEN } from "src/config.js";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}


declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response,next:NextFunction) => {
  try {
    const token = req?.cookies?.token
    if(!token){
        throw new AppError("","",404)
    }
    const payload = jwt.verify(
      token,
      TOKEN.SECRET_KEY?.toString()??"",
    ) as JwtPayload;
    req.user = payload
    next()
  } catch (error) {
    console.error("[authMiddleware] Token không hợp lệ:", error);
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    return;
  }
};

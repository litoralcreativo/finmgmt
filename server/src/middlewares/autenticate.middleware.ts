import { Request, Response, NextFunction } from "express";
import { ResponseStrategy } from "../models/response.model";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({
      ...new ResponseStrategy(403, "Access denied"),
    });
  }
  return next();
};

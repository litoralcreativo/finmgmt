import { Request, Response, NextFunction } from "express";
import { ResponseStrategy } from "../models/response.model";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || "your-secret-key";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      code: 403,
      msg: "Access denied",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        code: 403,
        msg: "Access denied",
      });
    }

    // Attach the decoded user info to the request object
    req.user = decoded;
    next();
  });
};

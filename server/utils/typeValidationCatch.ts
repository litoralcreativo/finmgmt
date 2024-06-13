import { ZodError } from "zod";
import { Response } from "express";
import { ResponseStrategy } from "../src/models/response.model";

export const typeValidationCatch = <T extends Error>(err: T, res: Response) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      ...new ResponseStrategy(400, err.issues.map((x) => x.message).join("; ")),
    });
    return;
  } else {
    throw err;
  }
};

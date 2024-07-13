import { Request, Response } from "express";

export const mercadoPagoWebHook = (req: Request, res: Response) => {
  console.log({ "req.headers": req.headers, "req.body": req.body });
  return res.status(200).send("");
};

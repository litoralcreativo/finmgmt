import { Request, Response } from "express";

export class ResponseStrategy {
  timestamp: number;
  msg: string;
  code: number;

  constructor(code: number, msg: string) {
    this.timestamp = Date.now();
    this.msg = msg;
    this.code = code;
  }
}

export class Responses {
  static BadRequest(res: Response, message: string) {
    return res.status(400).json({
      ...new ResponseStrategy(400, message),
    });
  }
}

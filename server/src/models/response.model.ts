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

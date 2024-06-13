"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Responses = exports.ResponseStrategy = void 0;
class ResponseStrategy {
    constructor(code, msg) {
        this.timestamp = Date.now();
        this.msg = msg;
        this.code = code;
    }
}
exports.ResponseStrategy = ResponseStrategy;
class Responses {
    static BadRequest(res, message) {
        return res.status(400).json(Object.assign({}, new ResponseStrategy(400, message)));
    }
}
exports.Responses = Responses;

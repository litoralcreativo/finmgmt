"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secretKey = process.env.JWT_SECRET || "your-secret-key";
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({
            code: 403,
            msg: "Access denied",
        });
    }
    const token = authHeader.split(" ")[1];
    jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
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
exports.requireAuth = requireAuth;

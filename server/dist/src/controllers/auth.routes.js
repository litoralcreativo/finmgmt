"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const autenticate_middleware_1 = require("../middlewares/autenticate.middleware");
const auth_controller_1 = require("./auth.controller");
const router = express_1.default.Router();
exports.router = router;
router.post("/login", auth_controller_1.login);
router.post("/logout", auth_controller_1.logout);
router.post("/register", auth_controller_1.registration);
router.get("/user", autenticate_middleware_1.requireAuth, auth_controller_1.getUserInfo);
router.get("/authenticated", auth_controller_1.checkIsAuth);

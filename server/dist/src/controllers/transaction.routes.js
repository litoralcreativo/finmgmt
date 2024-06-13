"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const pagination_middleware_1 = __importDefault(require("../middlewares/pagination.middleware"));
const transaction_controller_1 = require("./transaction.controller");
const router = express_1.default.Router();
exports.router = router;
router.get("/", pagination_middleware_1.default, transaction_controller_1.getAllPaginatedTransaction);
router.get("/:id", transaction_controller_1.getTransactionById);
router.post("/", transaction_controller_1.createTransaction);

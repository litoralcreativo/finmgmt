"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const autenticate_middleware_1 = require("../middlewares/autenticate.middleware");
const pagination_middleware_1 = __importDefault(require("../middlewares/pagination.middleware"));
const account_controller_1 = require("./account.controller");
const transaction_controller_1 = require("./transaction.controller");
const router = express_1.default.Router();
exports.router = router;
router.get("/", autenticate_middleware_1.requireAuth, account_controller_1.getByUser);
router.post("/", autenticate_middleware_1.requireAuth, account_controller_1.create);
router.patch("/fav/:id", autenticate_middleware_1.requireAuth, account_controller_1.setFavorite);
router.get("/:id", autenticate_middleware_1.requireAuth, account_controller_1.getById);
router.get("/:id/transactions", autenticate_middleware_1.requireAuth, pagination_middleware_1.default, transaction_controller_1.getPaginatedTransactionByAccountId);
router.get("/:id/categories", autenticate_middleware_1.requireAuth, account_controller_1.getAccountAmountsByCategory);

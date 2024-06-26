import express from "express";
import { requireAuth } from "../middlewares/autenticate.middleware";
import validatePagination from "../middlewares/pagination.middleware";
import {
  create,
  getAccountAmountsByCategory,
  getAccountBalanceById,
  getById,
  getByUser,
  getWholeBalance,
  setFavorite,
} from "./account.controller";
import { getPaginatedTransactionByAccountId } from "./transaction.controller";

const router = express.Router();

router.get("/", requireAuth, getByUser);
router.post("/", requireAuth, create);
router.patch("/fav/:id", requireAuth, setFavorite);
router.get("/balance", requireAuth, getWholeBalance);
router.get("/:id", requireAuth, getById);
router.get("/:id/balance", requireAuth, getAccountBalanceById);
router.get(
  "/:id/transactions",
  requireAuth,
  validatePagination,
  getPaginatedTransactionByAccountId
);
router.get("/:id/categories", requireAuth, getAccountAmountsByCategory);

export { router };

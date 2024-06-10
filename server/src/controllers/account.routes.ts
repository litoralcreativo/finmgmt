import express from "express";
import { requireAuth } from "../middlewares/autenticate.middleware";
import validatePagination from "../middlewares/pagination.middleware";
import { create, getById, getByUser, setFavorite } from "./account.controller";
import { getPaginatedTransactionByAccountId } from "./transaction.controller";

const router = express.Router();

router.get("/", requireAuth, getByUser);
router.post("/", requireAuth, create);
router.patch("/fav/:id", requireAuth, setFavorite);
router.get("/:id", requireAuth, getById);
router.get(
  "/:id/transactions",
  requireAuth,
  validatePagination,
  getPaginatedTransactionByAccountId
);

export { router };

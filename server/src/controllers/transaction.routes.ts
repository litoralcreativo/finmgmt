import express from "express";
import validatePagination from "../middlewares/pagination.middleware";
import {
  getAllPaginatedTransaction,
  getTransactionById,
  createTransaction,
  updateTransactionById,
  deleteTransactionById,
  createSwapTransactions,
} from "./transaction.controller";

const router = express.Router();

router.get("/", validatePagination, getAllPaginatedTransaction);

router.get("/:id", getTransactionById);

router.post("/", createTransaction);

router.post("/swap", createSwapTransactions);

router.patch("/:id", updateTransactionById);

router.delete("/:id", deleteTransactionById);

export { router };

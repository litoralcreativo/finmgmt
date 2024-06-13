import express from "express";
import { requireAuth } from "../middlewares/autenticate.middleware";
import validatePagination from "../middlewares/pagination.middleware";
import {
  createScope,
  getAllScope,
  getScopeAmountsByCategory,
  getScopeById,
} from "./financialScope.controller";

const router = express.Router();

router.get("/", validatePagination, getAllScope);
router.post("/", requireAuth, createScope);
router.get("/:id", getScopeById);
router.get("/:id/categories", getScopeAmountsByCategory);

export { router };

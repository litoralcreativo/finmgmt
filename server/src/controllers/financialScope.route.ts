import express from "express";
import { requireAuth } from "../middlewares/autenticate.middleware";
import validatePagination from "../middlewares/pagination.middleware";
import {
  createCategoryForScope,
  createScope,
  getAllScope,
  getScopeAmountsByCategory,
  getScopeById,
  updateCategoryForScope,
  getTransactionsByScopeId,
  generateMonthlyReport, // Nueva importación
} from "./financialScope.controller";

const router = express.Router();

router.get("/", validatePagination, getAllScope);
router.post("/", requireAuth, createScope);
router.get("/:id", getScopeById);
router.get("/:id/categories", getScopeAmountsByCategory);
router.get("/:id/transactions", validatePagination, getTransactionsByScopeId);
router.post("/:id/category", createCategoryForScope);
router.patch("/:id/category/:catname", updateCategoryForScope);

// Nueva ruta para generar reportes mensuales
router.get("/:id/report/monthly", requireAuth, generateMonthlyReport);

export { router };

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
} from "./financialScope.controller";

const router = express.Router();

router.get("/", validatePagination, getAllScope);
router.post("/", requireAuth, createScope);
router.get("/:id", getScopeById);
router.get("/:id/categories", getScopeAmountsByCategory);
router.post("/:id/category", createCategoryForScope);
router.patch("/:id/category/:catname", updateCategoryForScope);

export { router };

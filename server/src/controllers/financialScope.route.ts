import express from "express";
import validatePagination from "../middlewares/pagination.middleware";
import { getAllScope, getScopeById } from "./financialScope.controller";

const router = express.Router();

router.get("/", validatePagination, getAllScope);

router.get("/:id", getScopeById);

export { router };

import express from "express";
import validatePagination from "../middlewares/pagination.middleware";
import { getAllSpaces, getSpaceById } from "./financialSpace.controller";

const router = express.Router();

router.get("/", validatePagination, getAllSpaces);

router.get("/:id", getSpaceById);

/* router.post("/", createMovement);

router.put("/:id", updateMovementById);

router.delete("/:id", deleteMovementById); */

export { router };

import express from "express";
import validatePagination from "../middlewares/pagination.middleware";
import {
  getAllMovement,
  getMovementById,
  createMovement,
  updateMovementById,
  deleteMovementById,
} from "./movement.controller";

const router = express.Router();

router.get("/", validatePagination, getAllMovement);

router.get("/:id", getMovementById);

router.post("/", createMovement);

router.put("/:id", updateMovementById);

router.delete("/:id", deleteMovementById);

export { router };

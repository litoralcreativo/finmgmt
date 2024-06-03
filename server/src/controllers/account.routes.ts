import express from "express";
import { requireAuth } from "../middlewares/autenticate.middleware";
import { create, getByUser } from "./account.controller";

const router = express.Router();

router.get("/", requireAuth, getByUser);
router.post("/", requireAuth, create);

export { router };

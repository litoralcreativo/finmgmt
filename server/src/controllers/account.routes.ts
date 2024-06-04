import express from "express";
import { requireAuth } from "../middlewares/autenticate.middleware";
import { create, getById, getByUser, setFavorite } from "./account.controller";

const router = express.Router();

router.get("/", requireAuth, getByUser);
router.post("/", requireAuth, create);
router.patch("/fav/:id", requireAuth, setFavorite);
router.get("/:id", requireAuth, getById);

export { router };

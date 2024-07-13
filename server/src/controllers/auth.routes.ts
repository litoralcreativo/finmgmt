import express from "express";
import { requireAuth } from "../middlewares/autenticate.middleware";
import { getUserInfo, login, registration } from "./auth.controller";

const router = express.Router();

router.post("/register", registration);

router.post("/login", login);

router.get("/user", requireAuth, getUserInfo);

export { router };

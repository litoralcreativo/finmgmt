import express from "express";
import { requireAuth } from "../middlewares/autenticate.middleware";
import {
  getForeingUserInfo,
  getUserInfo,
  login,
  registration,
} from "./auth.controller";

const router = express.Router();

router.post("/register", registration);

router.post("/login", login);

router.get("/user", requireAuth, getUserInfo);

router.get("/foreinguser/:id", getForeingUserInfo);

export { router };

import express from "express";
import { requireAuth } from "../middlewares/autenticate.middleware";
import {
  checkIsAuth,
  getUserInfo,
  login,
  logout,
  registration,
} from "./auth.controller";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", registration);
router.get("/user", requireAuth, getUserInfo);
router.get("/authenticated", checkIsAuth);

export { router };

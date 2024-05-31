import express from "express";
import passport from "passport";
import { requireAuth } from "../middlewares/autenticate.middleware";
import {
  getUserInfo,
  localAuthLogin,
  localAuthLogout,
  localAuthRegistration,
} from "./auth.controller";

const router = express.Router();

router.post("/register", localAuthRegistration);
router.post("/login", localAuthLogin);
router.post("/logout", localAuthLogout);
router.get("/user", requireAuth, getUserInfo);

export { router };

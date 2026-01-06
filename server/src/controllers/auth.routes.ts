import express from "express";
import { requireAuth } from "../middlewares/autenticate.middleware";
import {
  getForeingUserInfo,
  getUserInfo,
  login,
  reautenticate,
  registration,
  webauthnRegisterRequest,
  webauthnRegisterResponse,
  webauthnLoginRequest,
  webauthnLoginResponse,
} from "./auth.controller";

const router = express.Router();

router.post("/register", registration);

router.post("/login", login);

router.get("/reauth", requireAuth, reautenticate);

router.get("/user", requireAuth, getUserInfo);

router.get("/foreinguser/:id", getForeingUserInfo);

router.post("/webauthn/register-request", webauthnRegisterRequest);
router.post("/webauthn/register-response", webauthnRegisterResponse);
router.post("/webauthn/login-request", webauthnLoginRequest);
router.post("/webauthn/login-response", webauthnLoginResponse);

export { router };

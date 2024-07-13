import express from "express";
import { mercadoPagoWebHook } from "./notifications.controller";

const router = express.Router();

router.post("/mercadopago", mercadoPagoWebHook);

export { router };

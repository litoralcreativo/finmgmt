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

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID.
 *           example: 0
 *         name:
 *           type: string
 *           description: The user's name.
 *           example: Leanne Graham
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Log out user
 *     tags: [Authentication]
 *     responses:
 *       '200':
 *         description: User logged out successfully
 *       '401':
 *         description: User not authenticated
 */
router.post("/logout", logout);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad request - Invalid user data
 *       '500':
 *         description: Internal server error
 */
router.post("/register", registration);

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: User not authenticated or token expired
 */
router.get("/user", requireAuth, getUserInfo);

/**
 * @swagger
 * /auth/authenticated:
 *   get:
 *     summary: Check if user is authenticated
 *     tags: [Authentication]
 *     responses:
 *       '200':
 *         description: User is authenticated
 *       '401':
 *         description: User not authenticated
 */
router.get("/authenticated", checkIsAuth);

export { router };

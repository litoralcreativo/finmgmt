import express from "express";
import passport from "passport";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { router as authRouter, router } from "./controllers/auth.routes";
import { router as accountRouter } from "./controllers/account.routes";
import { router as transactionRouter } from "./controllers/transaction.routes";
import { router as scopeRouter } from "./controllers/financialScope.route";
import { swaggerSpec } from "./swagger";
import { requireAuth } from "./middlewares/autenticate.middleware";
import "./auth";
import ServerlessHttp from "serverless-http";

const apiPrefix = process.env.API_PREFIX || "";

const app = express();
const PORT = 3000;

// cors config
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(passport.initialize());

app.use(express.json());
app.use(`${apiPrefix}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/account`, accountRouter);
app.use(`${apiPrefix}/transaction`, requireAuth, transactionRouter);
app.use(`${apiPrefix}/scopes`, requireAuth, scopeRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    timestamp: Date.now(),
    msg: "No route matches your request",
    req: req.url,
    code: 404,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running...`);
});

export const handler = ServerlessHttp(app);

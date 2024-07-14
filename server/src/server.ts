import express from "express";
import passport from "passport";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

import { router as authRouter, router } from "./controllers/auth.routes";
import { router as accountRouter } from "./controllers/account.routes";
import { router as transactionRouter } from "./controllers/transaction.routes";
import { router as scopeRouter } from "./controllers/financialScope.route";
import { router as notificationsRouter } from "./controllers/notifications.route";

import swaggerOptions from "./swagger-doc/swagger";
import { requireAuth } from "./middlewares/autenticate.middleware";
import "./auth";
import ServerlessHttp from "serverless-http";
import { cronService } from "./services/cron.service";

cronService;

const apiPrefix = process.env.API_PREFIX || "";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins: string[] = process.env.CORS_ORIGINS?.split(",") || [];

// cors config
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.error(allowedOrigins.join(" - "));
        console.error(origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(passport.initialize());

app.use(express.json());

app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/account`, accountRouter);
app.use(`${apiPrefix}/transaction`, requireAuth, transactionRouter);
app.use(`${apiPrefix}/scopes`, requireAuth, scopeRouter);
app.use(`${apiPrefix}/notifications`, notificationsRouter);

app.use(`${apiPrefix}/dummy`, (req, res) => res.status(200).send("ok"));

app.use(
  `${apiPrefix}/api-docs`,
  swaggerUi.serve,
  swaggerUi.setup(swaggerOptions)
);

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

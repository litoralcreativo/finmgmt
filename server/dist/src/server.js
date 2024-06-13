"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = require("./controllers/auth.routes");
const account_routes_1 = require("./controllers/account.routes");
const transaction_routes_1 = require("./controllers/transaction.routes");
const financialScope_route_1 = require("./controllers/financialScope.route");
const swagger_1 = require("./swagger");
const autenticate_middleware_1 = require("./middlewares/autenticate.middleware");
require("./auth");
const app = (0, express_1.default)();
const PORT = 3000;
// cors config
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(passport_1.default.initialize());
app.use(express_1.default.json());
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use("/auth", auth_routes_1.router);
app.use("/account", account_routes_1.router);
app.use("/transaction", autenticate_middleware_1.requireAuth, transaction_routes_1.router);
app.use("/scopes", autenticate_middleware_1.requireAuth, financialScope_route_1.router);
app.all("*", (req, res) => {
    res.status(404).json({
        timestamp: Date.now(),
        msg: "No route matches your request",
        code: 404,
    });
});
app.listen(PORT, () => {
    console.log(`Server is running: http://localhost:${PORT}/api-docs`);
});
exports.default = app;

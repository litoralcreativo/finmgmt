"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsAuth = exports.getUserInfo = exports.logout = exports.login = exports.registration = void 0;
const passport_1 = __importDefault(require("passport"));
const db_1 = require("../../bdd/db");
const response_model_1 = require("../models/response.model");
const user_model_1 = require("../models/user.model");
const user_service_1 = require("../services/user.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
let userService;
db_1.DbManager.getInstance().subscribe((x) => {
    if (x)
        userService = new user_service_1.UserService(x);
});
const registration = (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const newUser = new user_model_1.User();
        newUser.setFirstName(firstName);
        newUser.setLastName(lastName);
        newUser.setEmail(email);
        newUser.setPassword(password);
        userService.getByEmail(email).subscribe((user) => {
            if (user) {
                return res
                    .status(400)
                    .json(Object.assign({}, new response_model_1.ResponseStrategy(400, "Email already used")));
            }
            userService.createOne(newUser).subscribe((val) => {
                res.status(200).json(Object.assign(Object.assign({}, new response_model_1.ResponseStrategy(200, "Successfuly registered")), { user }));
            });
        });
    }
    catch (e) {
        res.status(400).json(Object.assign({}, new response_model_1.ResponseStrategy(400, e.message)));
    }
};
exports.registration = registration;
const login = (req, res, next) => {
    try {
        passport_1.default.authenticate("local", { session: false }, (err, user) => {
            if (err) {
                return res.status(401).json(Object.assign({}, new response_model_1.ResponseStrategy(401, err)));
            }
            req.logIn(user, { session: false }, (err) => {
                if (err) {
                    return next();
                }
                const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, {
                    expiresIn: "1h",
                });
                return res.json({ redirectTo: "/dashboard", token });
                /* res.status(200).json({ redirectTo: "/dashboard" }); */
            });
        })(req, res, next);
    }
    catch (e) {
        throw e;
    }
};
exports.login = login;
const logout = (req, res, next) => {
    try {
        res.clearCookie("app-auth");
        res.status(200).json({
            timestamp: Date.now(),
            msg: "Logged out successfully",
            code: 200,
        });
        /* req.logout((err) => {
          if (err) {
            next(err);
          }
          req.session.destroy((err) => {
            if (err) {
              next(err);
            }
            res.clearCookie("app-auth");
            res.status(200).json({
              timestamp: Date.now(),
              msg: "Logged out successfully",
              code: 200,
            });
          });
        }); */
    }
    catch (error) {
        console.error(error);
        res.status(500).json(Object.assign({}, new response_model_1.ResponseStrategy(500, "Fail to get user, internal server error")));
    }
};
exports.logout = logout;
const getUserInfo = (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        userService.getById(userId).subscribe({
            next: (user) => {
                if (!user) {
                    return res
                        .status(400)
                        .json(Object.assign({}, new response_model_1.ResponseStrategy(400, "User not found")));
                }
                return res.status(200).json({
                    email: user.email,
                    name: user.name,
                });
            },
            error: (err) => {
                throw new Error(err);
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json(Object.assign({}, new response_model_1.ResponseStrategy(500, "Fail to get user, internal server error")));
    }
};
exports.getUserInfo = getUserInfo;
const checkIsAuth = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            code: 401,
            msg: "Not authenticated",
            isAuth: false,
        });
    }
    const token = authHeader.split(" ")[1];
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                code: 401,
                msg: "Not authenticated",
                isAuth: false,
            });
        }
        res.status(200).json({
            code: 200,
            msg: "Authenticated",
            isAuth: true,
        });
    });
};
exports.checkIsAuth = checkIsAuth;

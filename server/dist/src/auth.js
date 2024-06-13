"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_jwt_2 = require("passport-jwt");
const passport_local_1 = require("passport-local");
const bcrypt_1 = __importDefault(require("bcrypt"));
const rxjs_1 = require("rxjs");
const db_1 = require("../bdd/db");
const user_service_1 = require("./services/user.service");
let userService;
db_1.DbManager.getInstance().subscribe((x) => {
    if (x)
        userService = new user_service_1.UserService(x);
});
passport_1.default.use("local", new passport_local_1.Strategy({ passReqToCallback: true }, (req, username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    // try fetching the user
    const user = yield (0, rxjs_1.lastValueFrom)(userService.getByEmail(username));
    if (!user)
        return done("Password or username is incorrect", false);
    const result = bcrypt_1.default.compareSync(password, user.security.passwordHash);
    if (!result)
        return done("Password or username is incorrect", false);
    return done(null, user);
})));
const JWT_SECRET = "your_jwt_secret"; // Cambia esto por una clave secreta segura
// Estrategia JWT
const opts = {
    jwtFromRequest: passport_jwt_2.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
};
passport_1.default.use(new passport_jwt_1.Strategy(opts, (jwt_payload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userService.getById(jwt_payload.id);
        if (user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    }
    catch (error) {
        return done(error, false);
    }
})));
module.exports = passport_1.default;

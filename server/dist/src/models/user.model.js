"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const validator_1 = __importDefault(require("validator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class User {
    get _id() {
        return this.id;
    }
    set _id(value) {
        this.id = value;
    }
    constructor() {
        this.created = Date.now();
        this.name = {
            first: null,
            last: null,
        };
        this.email = null;
        this.security = {
            passwordHash: null,
        };
    }
    setFirstName(firstName) {
        try {
            if (firstName)
                firstName = firstName.trim().replace(/ +/g, " ");
            if (validator_1.default.isEmpty(firstName))
                throw new Error("firstName is empty");
            if (!validator_1.default.isAlphanumeric(firstName))
                throw new Error("firstName must be alphanumeric");
            this.name.first = firstName;
        }
        catch (error) {
            throw error;
        }
    }
    setLastName(lastName) {
        try {
            if (lastName)
                lastName = lastName.trim().replace(/ +/g, " ");
            if (validator_1.default.isEmpty(lastName))
                throw new Error("lastName is empty");
            if (!validator_1.default.isAlphanumeric(lastName))
                throw new Error("lastName must be alphanumeric");
            this.name.last = lastName;
        }
        catch (error) {
            throw error;
        }
    }
    setEmail(email) {
        try {
            if (email)
                email = email.trim().replace(/ +/g, " ");
            if (validator_1.default.isEmpty(email))
                throw new Error("email is empty");
            if (!validator_1.default.isEmail(email))
                throw new Error("email doesn't have the correct format");
            this.email = email;
        }
        catch (error) {
            throw error;
        }
    }
    setPassword(password) {
        try {
            if (validator_1.default.isEmpty(password))
                throw new Error("password is empty");
            if (!validator_1.default.isLength(password, { min: 6, max: 12 }))
                throw new Error("password must be 6 to 12 characters long");
            this.security.passwordHash = bcrypt_1.default.hashSync(password, 10);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.User = User;

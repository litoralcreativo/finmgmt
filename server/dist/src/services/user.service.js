"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const rxjs_1 = require("rxjs");
const crud_model_1 = require("../models/crud.model");
class UserService extends crud_model_1.Crud {
    constructor(db) {
        super(db, "user");
    }
    getByEmail(email) {
        const filter = { email: email };
        return (0, rxjs_1.from)(this.collection.findOne(filter));
    }
}
exports.UserService = UserService;

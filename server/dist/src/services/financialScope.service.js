"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialScopeService = void 0;
const crud_model_1 = require("../models/crud.model");
class FinancialScopeService extends crud_model_1.Crud {
    constructor(db) {
        super(db, "financial_scope");
    }
}
exports.FinancialScopeService = FinancialScopeService;

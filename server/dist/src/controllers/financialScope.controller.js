"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScopeAmountsByCategory = exports.getScopeById = exports.getAllScope = void 0;
const db_1 = require("../../bdd/db");
const response_model_1 = require("../models/response.model");
const financialScope_service_1 = require("../services/financialScope.service");
const transaction_service_1 = require("../services/transaction.service");
let financialScope;
db_1.DbManager.getInstance().subscribe((x) => {
    if (x)
        financialScope = new financialScope_service_1.FinancialScopeService(x);
});
let transactionService;
db_1.DbManager.getInstance().subscribe((x) => {
    if (x)
        transactionService = new transaction_service_1.TransactionService(x);
});
const getAllScope = (req, res) => {
    const filter = {
        users: { $eq: (req === null || req === void 0 ? void 0 : req.user).id },
    };
    financialScope.getAll(undefined, filter).subscribe((val) => {
        return res.json(val);
    });
};
exports.getAllScope = getAllScope;
const getScopeById = (req, res) => {
    const id = req.params.id;
    financialScope.getById(id).subscribe((val) => {
        if (!val) {
            res.status(404).json({ message: "Item not found" });
        }
        else {
            res.status(200).json(val);
        }
    });
};
exports.getScopeById = getScopeById;
const getScopeAmountsByCategory = (req, res) => {
    try {
        const { id } = req.params;
        const { year, month } = req.query;
        let from = new Date();
        let to = new Date();
        //#region DateRange validations
        let intYear = parseInt(year);
        if (!year)
            throw new TypeError("year is not defined");
        if (isNaN(intYear))
            throw new TypeError("year is not a number");
        if (intYear < 1900 || intYear > 2100)
            throw new TypeError("year must be between 1900 and 2100");
        let intMonth = parseInt(month);
        if (!month)
            throw new TypeError("month is not defined");
        if (isNaN(intMonth))
            throw new TypeError("month is not a number");
        if (intYear < 1900 || intYear > 2100)
            throw new TypeError("month must be between 0 and 11");
        //#endregion
        from = new Date(intYear, intMonth);
        to = new Date(intYear, intMonth + 1);
        to.setMinutes(to.getMinutes() - 1);
        transactionService
            .getCategoryAmountsByScope(id, { from: from, to: to })
            .subscribe((result) => {
            const mapped = {
                year: intYear,
                month: intMonth,
                groups: result.map((group) => {
                    const result = {
                        category: group._id,
                        amount: group.total,
                    };
                    return result;
                }),
            };
            return res.status(200).send(mapped);
        });
    }
    catch (error) {
        if (error instanceof TypeError) {
            res.status(400).json(Object.assign({}, new response_model_1.ResponseStrategy(400, error.message)));
            return;
        }
        res.status(500).json(Object.assign({}, new response_model_1.ResponseStrategy(500, "Internal server error")));
    }
};
exports.getScopeAmountsByCategory = getScopeAmountsByCategory;

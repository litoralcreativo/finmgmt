"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountAmountsByCategory = exports.setFavorite = exports.getById = exports.create = exports.getByUser = void 0;
const mongodb_1 = require("mongodb");
const db_1 = require("../../bdd/db");
const response_model_1 = require("../models/response.model");
const account_service_1 = require("../services/account.service");
const transaction_service_1 = require("../services/transaction.service");
let accountService;
db_1.DbManager.getInstance().subscribe((x) => {
    if (x)
        accountService = new account_service_1.AccountService(x);
});
let transactionService;
db_1.DbManager.getInstance().subscribe((x) => {
    if (x)
        transactionService = new transaction_service_1.TransactionService(x);
});
const getByUser = (req, res) => {
    var _a;
    try {
        let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const filter = { user_id: userId };
        accountService
            .getAll({
            page: 0,
            pageSize: 1000,
        }, filter)
            .subscribe((val) => {
            res.status(200).json(val.elements);
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json(Object.assign({}, new response_model_1.ResponseStrategy(500, "Internal server error")));
    }
};
exports.getByUser = getByUser;
const create = (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        let dto = req.body;
        dto = Object.assign(Object.assign({}, req.body), { user_id: userId, favorite: false, created: new Date(), amount: 0 });
        accountService.createOne(dto).subscribe((val) => res.status(200).json(Object.assign({}, new response_model_1.ResponseStrategy(200, "OK"))));
    }
    catch (error) {
        console.error(error);
        res.status(500).json(Object.assign({}, new response_model_1.ResponseStrategy(500, "Internal server error")));
    }
};
exports.create = create;
const getById = (req, res) => {
    var _a;
    try {
        let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { id } = req.params;
        const filter = {
            user_id: userId,
            _id: new mongodb_1.ObjectId(id),
        };
        accountService.getSingle(filter).subscribe((val) => {
            if (val)
                return res.status(200).json(val);
            else
                return res.status(404).json(Object.assign({}, new response_model_1.ResponseStrategy(404, "Item not found")));
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json(Object.assign({}, new response_model_1.ResponseStrategy(500, "Internal server error")));
    }
};
exports.getById = getById;
const setFavorite = (req, res) => {
    var _a;
    try {
        let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { id } = req.params;
        const { favorite } = req.body;
        const filter = {
            user_id: userId,
            _id: new mongodb_1.ObjectId(id),
        };
        accountService
            .updateOne(filter, { favorite: favorite })
            .subscribe((val) => {
            if (val)
                return res.status(200).json(val);
            else
                return res.status(404).json(Object.assign({}, new response_model_1.ResponseStrategy(404, "Item not found")));
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json(Object.assign({}, new response_model_1.ResponseStrategy(500, "Internal server error")));
    }
};
exports.setFavorite = setFavorite;
const getAccountAmountsByCategory = (req, res) => {
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
            .getCategoryAmountsByAccount(id, { from: from, to: to })
            .subscribe((result) => {
            const mapped = {
                year: intYear,
                month: intMonth,
                groups: result.map((group) => {
                    return {
                        category: group._id.category,
                        amount: group.total,
                        scope: {
                            _id: group._id._id,
                            icon: group._id.icon,
                            name: group._id.name,
                        },
                    };
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
exports.getAccountAmountsByCategory = getAccountAmountsByCategory;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const rxjs_1 = require("rxjs");
const crud_model_1 = require("../models/crud.model");
class TransactionService extends crud_model_1.Crud {
    constructor(db) {
        super(db, "transaction");
    }
    getAccountAmount(account_id) {
        const pipeline = [
            {
                $match: {
                    account_id: account_id,
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: "$amount",
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalAmount: 1,
                },
            },
        ];
        return (0, rxjs_1.from)(this.collection.aggregate(pipeline)).pipe((0, rxjs_1.map)((x) => {
            return x;
        }));
    }
    getCategoryAmountsByAccount(account_id, range) {
        const pipeline = [
            {
                $match: {
                    account_id: account_id,
                    date: {
                        $gte: range.from,
                        $lte: range.to,
                    },
                },
            },
            {
                $group: {
                    _id: "$scope",
                    total: { $sum: "$amount" },
                },
            },
        ];
        return (0, rxjs_1.from)(this.collection.aggregate(pipeline).toArray()).pipe((0, rxjs_1.map)((x) => {
            return x;
        }));
    }
    getCategoryAmountsByScope(scope_id, range) {
        const pipeline = [
            {
                $match: {
                    "scope._id": scope_id,
                    date: {
                        $gte: range.from,
                        $lte: range.to,
                    },
                },
            },
            {
                $group: {
                    _id: "$scope.category",
                    total: { $sum: "$amount" },
                },
            },
        ];
        return (0, rxjs_1.from)(this.collection.aggregate(pipeline).toArray()).pipe((0, rxjs_1.map)((x) => {
            return x;
        }));
    }
}
exports.TransactionService = TransactionService;

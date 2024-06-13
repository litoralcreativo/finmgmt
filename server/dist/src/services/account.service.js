"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const rxjs_1 = require("rxjs");
const db_1 = require("../../bdd/db");
const crud_model_1 = require("../models/crud.model");
const transaction_service_1 = require("./transaction.service");
let transactionService;
db_1.DbManager.getInstance().subscribe((x) => {
    if (x)
        transactionService = new transaction_service_1.TransactionService(x);
});
class AccountService extends crud_model_1.Crud {
    constructor(db) {
        super(db, "account");
    }
    updateAccountAmount(account_id) {
        return transactionService.getAccountAmount(account_id).pipe((0, rxjs_1.switchMap)((amount) => {
            console.log("amount: ", amount);
            return this.updateOneById(account_id, { amount: amount.totalAmount });
        }));
    }
}
exports.AccountService = AccountService;

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = exports.getTransactionById = exports.getPaginatedTransactionByAccountId = exports.getAllPaginatedTransaction = void 0;
const db_1 = require("../../bdd/db");
const transaction_service_1 = require("../services/transaction.service");
const response_model_1 = require("../models/response.model");
const financialScope_service_1 = require("../services/financialScope.service");
const rxjs_1 = require("rxjs");
const account_service_1 = require("../services/account.service");
let transactionService;
db_1.DbManager.getInstance().subscribe((x) => {
    if (x)
        transactionService = new transaction_service_1.TransactionService(x);
});
let financialScope;
db_1.DbManager.getInstance().subscribe((x) => {
    if (x)
        financialScope = new financialScope_service_1.FinancialScopeService(x);
});
let accountService;
db_1.DbManager.getInstance().subscribe((x) => {
    if (x)
        accountService = new account_service_1.AccountService(x);
});
const getAllPaginatedTransaction = (req, res) => {
    // We already know this values came as string representation of integers
    // because they where validated in "validatePagination"
    let { page, pageSize } = req.query;
    let { name, description } = req.query;
    const filter = {};
    if (typeof name === "string")
        filter.nombre = { $regex: new RegExp(name) };
    if (typeof description === "string")
        filter.descripcion = { $regex: new RegExp(description) };
    transactionService
        .getAll({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
    }, filter)
        .subscribe((val) => res.json(val));
};
exports.getAllPaginatedTransaction = getAllPaginatedTransaction;
const getPaginatedTransactionByAccountId = (req, res) => {
    try {
        const accountId = req.params.id;
        let { page, pageSize } = req.query;
        let { year, month } = req.query;
        const filter = {};
        filter.account_id = { $eq: accountId };
        if (year) {
            const yearInt = parseInt(year);
            let dateFrom = new Date(yearInt, 0, 1);
            let dateTo = new Date(yearInt + 1, 0, 1);
            if (month) {
                const monthInt = parseInt(month);
                dateFrom = new Date(yearInt, monthInt - 1, 1);
                dateTo = new Date(yearInt, monthInt, 1);
            }
            filter.date = {
                $gte: dateFrom,
                $lt: dateTo,
            };
        }
        let dateDirection = -1;
        let idDirection = -1;
        const sort = { date: dateDirection, _id: idDirection }; // Ordenar por fecha descendente
        transactionService
            .getAll({
            page: parseInt(page),
            pageSize: parseInt(pageSize),
        }, filter, sort)
            .subscribe((val) => res.json(val));
    }
    catch (error) {
        res.status(500).json(Object.assign({}, new response_model_1.ResponseStrategy(500, error.toString())));
    }
};
exports.getPaginatedTransactionByAccountId = getPaginatedTransactionByAccountId;
const getTransactionById = (req, res) => {
    const id = req.params.id;
    transactionService.getById(id).subscribe((val) => {
        if (!val) {
            res.status(404).json({ message: "Item not found" });
        }
        else {
            res.status(200).json(val);
        }
    });
};
exports.getTransactionById = getTransactionById;
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { account_id, amount, description, date } = req.body;
        const scopeId = (_a = req.body.scope) === null || _a === void 0 ? void 0 : _a._id;
        const categoryName = (_c = (_b = req.body.scope) === null || _b === void 0 ? void 0 : _b.category) === null || _c === void 0 ? void 0 : _c.name;
        const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.id;
        //#region validations
        if (!account_id)
            return response_model_1.Responses.BadRequest(res, "The account_id is missing");
        if (!amount)
            return response_model_1.Responses.BadRequest(res, "The amount is missing");
        if (!date)
            return response_model_1.Responses.BadRequest(res, "The date is missing");
        if (!scopeId)
            return response_model_1.Responses.BadRequest(res, "The scope id is missing");
        if (!categoryName)
            return response_model_1.Responses.BadRequest(res, "The categoryName is missing");
        if (!userId)
            return response_model_1.Responses.BadRequest(res, "The user id id is missing");
        //#endregion
        let insertion = {
            user_id: userId,
            account_id,
            amount,
            description,
            date: new Date(date),
        };
        const $getAccount = accountService.getById(account_id);
        const $getScope = financialScope.getById(scopeId);
        let account;
        yield (0, rxjs_1.firstValueFrom)($getAccount)
            .then((result) => {
            if (result) {
                insertion.account_id = account_id;
                account = result;
            }
            else {
                response_model_1.Responses.BadRequest(res, "The account doesn't exist");
            }
        })
            .catch((err) => response_model_1.Responses.BadRequest(res, "The account doesn't exist"));
        yield (0, rxjs_1.firstValueFrom)($getScope)
            .then((scopeData) => {
            if (!scopeData) {
                return (0, rxjs_1.throwError)(() => new Error("The scope doesn't exist"));
            }
            const category = scopeData.categories.find((x) => x.name === categoryName);
            if (!category) {
                return (0, rxjs_1.throwError)(() => new Error("The category doesn't exist in the scope"));
            }
            insertion.scope = {
                _id: scopeId,
                name: scopeData.name,
                icon: scopeData.icon,
                category: {
                    name: category.name,
                    icon: category.icon,
                    fixed: category.fixed,
                },
            };
        })
            .catch((err) => response_model_1.Responses.BadRequest(res, err.message));
        /* await firstValueFrom(transactionService.createOne(insertion))
          .then((val) => {})
          .catch((err) => Responses.BadRequest(res, "Not inserted")); */
        yield (0, rxjs_1.firstValueFrom)(transactionService.createOne(insertion))
            .then((val) => {
            if (!val) {
                return res.status(404).json({ message: "Not inserted" });
            }
        })
            .catch((err) => response_model_1.Responses.BadRequest(res, err.message));
        const acountAmount = yield (0, rxjs_1.firstValueFrom)(transactionService.getAccountAmount(account_id));
        const updated = yield (0, rxjs_1.firstValueFrom)(accountService.updateOneById(account_id, {
            amount: acountAmount.totalAmount,
        }));
        return res.status(200).json(Object.assign({}, new response_model_1.ResponseStrategy(200, "inserted")));
    }
    catch (error) {
        res.status(500).json(Object.assign({}, new response_model_1.ResponseStrategy(500, error.toString())));
    }
});
exports.createTransaction = createTransaction;
/* export const updateTransactionById = (req: Request, res: Response) => {
  const id = req.params.id;
  const dto: TransactionRequestDTO = req.body;
  if (req.body._id) {
    return res
      .status(400)
      .json({ message: "Including _id in the request body is not allowed" });
  }
  transactionService.updateOneById(id, dto).subscribe((result) => {
    if (!result.acknowledged) {
      res
        .status(500)
        .json({ message: "The DB culden't confirm the modification" });
    } else {
      if (result.matchedCount === 0) {
        res.status(404).json({ message: "Item not found" });
      } else {
        res.status(200).send(result.modifiedCount.toString());
      }
    }
  });
}; */
/* export const deleteTransactionById = (req: Request, res: Response) => {
  const id = req.params.id;
  transactionService.deleteOne(id).subscribe((result) => {
    if (!result.acknowledged) {
      res
        .status(500)
        .json({ message: "The DB culden't confirm the modification" });
    } else {
      if (result.deletedCount === 0) {
        res.status(404).json({ message: "Item not found" });
      } else {
        res.status(200).send(result.deletedCount.toString());
      }
    }
  });
}; */

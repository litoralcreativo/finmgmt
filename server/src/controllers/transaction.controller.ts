import { Request, Response } from "express";
import { Filter, ObjectId, SortDirection } from "mongodb";
import { DbManager } from "../bdd/db";
import {
  Transaction,
  TransactionRequestDTO,
} from "../models/transaction.model";
import { PaginatedType, PaginationRequest } from "../models/pagination.model";
import { TransactionService } from "../services/transaction.service";
import { Responses, ResponseStrategy } from "../models/response.model";
import { FinancialScopeService } from "../services/financialScope.service";
import {
  catchError,
  firstValueFrom,
  forkJoin,
  switchMap,
  throwError,
} from "rxjs";
import { AccountService } from "../services/account.service";
import { Account } from "../models/account.model";

let transactionService: TransactionService;
DbManager.getInstance().subscribe((x) => {
  if (x) transactionService = new TransactionService(x);
});

let financialScope: FinancialScopeService;
DbManager.getInstance().subscribe((x) => {
  if (x) financialScope = new FinancialScopeService(x);
});

let accountService: AccountService;
DbManager.getInstance().subscribe((x) => {
  if (x) accountService = new AccountService(x);
});

export const getAllPaginatedTransaction = (req: Request, res: Response) => {
  // We already know this values came as string representation of integers
  // because they where validated in "validatePagination"
  let { page, pageSize } = req.query;
  let { name, description } = req.query;

  const filter: Filter<Transaction> = {};
  if (typeof name === "string") filter.nombre = { $regex: new RegExp(name) };
  if (typeof description === "string")
    filter.descripcion = { $regex: new RegExp(description) };

  transactionService
    .getAll(
      {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      },
      filter
    )
    .subscribe((val) => res.json(val));
};

export const getPaginatedTransactionByAccountId = (
  req: Request,
  res: Response
) => {
  try {
    const accountId = req.params.id;
    let { page, pageSize } = req.query;
    let { year, month } = req.query;

    const filter: Filter<Transaction> = {};
    filter.account_id = { $eq: accountId };

    if (year) {
      const yearInt = parseInt(year as string);
      let dateFrom = new Date(yearInt, 0, 1);
      let dateTo = new Date(yearInt + 1, 0, 1);

      if (month) {
        const monthInt = parseInt(month as string);
        dateFrom = new Date(yearInt, monthInt - 1, 1);
        dateTo = new Date(yearInt, monthInt, 1);
      }

      filter.date = {
        $gte: dateFrom,
        $lt: dateTo,
      };
    }

    let dateDirection: SortDirection = -1;
    let idDirection: SortDirection = -1;
    const sort = { date: dateDirection, _id: idDirection }; // Ordenar por fecha descendente

    transactionService
      .getAll(
        {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string),
        },
        filter,
        sort
      )
      .subscribe((val) => res.json(val));
  } catch (error: any) {
    res.status(500).json({
      ...new ResponseStrategy(500, error.toString()),
    });
  }
};

export const getTransactionById = (req: Request, res: Response) => {
  const id = req.params.id;
  transactionService.getById(id).subscribe((val) => {
    if (!val) {
      res.status(404).json({ message: "Item not found" });
    } else {
      res.status(200).json(val);
    }
  });
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { account_id, amount, description, date } = req.body;
    const scopeId = req.body.scope?._id;
    const categoryName = req.body.scope?.category?.name;
    const userId: string = (req.user as any)?.id;

    //#region validations
    if (!account_id)
      return Responses.BadRequest(res, "The account_id is missing");
    if (!amount) return Responses.BadRequest(res, "The amount is missing");
    if (!date) return Responses.BadRequest(res, "The date is missing");
    if (!scopeId) return Responses.BadRequest(res, "The scope id is missing");
    if (!categoryName)
      return Responses.BadRequest(res, "The categoryName is missing");
    if (!userId) return Responses.BadRequest(res, "The user id id is missing");
    //#endregion

    let insertion: Partial<Transaction> = {
      user_id: userId,
      account_id,
      amount,
      description,
      date: new Date(date),
    };

    const $getAccount = accountService.getById(account_id);
    const $getScope = financialScope.getById(scopeId);

    let account: Account;

    await firstValueFrom($getAccount)
      .then((result) => {
        if (result) {
          insertion.account_id = account_id;
          account = result;
        } else {
          Responses.BadRequest(res, "The account doesn't exist");
        }
      })
      .catch((err) => Responses.BadRequest(res, "The account doesn't exist"));

    await firstValueFrom($getScope)
      .then((scopeData) => {
        if (!scopeData) {
          return throwError(() => new Error("The scope doesn't exist"));
        }

        const category = scopeData.categories.find(
          (x) => x.name === categoryName
        );

        if (!category) {
          return throwError(
            () => new Error("The category doesn't exist in the scope")
          );
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
      .catch((err) => Responses.BadRequest(res, err.message));

    await firstValueFrom(transactionService.createOne(insertion))
      .then((val) => {
        if (!val) {
          return res.status(404).json({ message: "Not inserted" });
        }
      })
      .catch((err) => Responses.BadRequest(res, err.message));

    const acountAmount = await firstValueFrom(
      transactionService.getAccountAmount(account_id)
    );

    const updated = await firstValueFrom(
      accountService.updateOneById(account_id, {
        amount: acountAmount.totalAmount,
      })
    );

    return res.status(200).json({
      ...new ResponseStrategy(200, "inserted"),
    });
  } catch (error: any) {
    res.status(500).json({
      ...new ResponseStrategy(500, error.toString()),
    });
  }
};

export const updateTransactionById = async (req: Request, res: Response) => {
  const transactionId = req.params.id;
  const { amount, description } = req.body;
  const scopeId = req.body.scope?._id;
  const categoryName = req.body.scope?.category?.name;

  //#region validations
  if (!amount) return Responses.BadRequest(res, "The amount is missing");
  if (!scopeId) return Responses.BadRequest(res, "The scope id is missing");
  if (!categoryName)
    return Responses.BadRequest(res, "The categoryName is missing");
  //#endregion

  const $getTransaction = transactionService.getById(transactionId);
  const $getScope = financialScope.getById(scopeId);

  let updated: Partial<Transaction> = {
    amount,
    description,
    scope: undefined,
  };

  let account_id: string;

  await firstValueFrom($getTransaction)
    .then((transaction) => {
      if (!transaction) {
        return throwError(() => new Error("The transaction doesn't exist"));
      }

      account_id = transaction.account_id;
    })
    .catch((err) => Responses.BadRequest(res, err.message));

  if (account_id! === undefined) throw new Error("No account id");

  await firstValueFrom($getScope)
    .then((scopeData) => {
      if (!scopeData) {
        return throwError(() => new Error("The scope doesn't exist"));
      }

      const category = scopeData.categories.find(
        (x) => x.name === categoryName
      );

      if (!category) {
        return throwError(
          () => new Error("The category doesn't exist in the scope")
        );
      }

      updated.scope = {
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
    .catch((err) => Responses.BadRequest(res, err.message));

  await firstValueFrom(transactionService.updateOneById(transactionId, updated))
    .then((val) => {
      if (!val) {
        return res.status(404).json({ message: "Not modified" });
      }
    })
    .catch((err) => Responses.BadRequest(res, err.message));

  const acountAmount = await firstValueFrom(
    transactionService.getAccountAmount(account_id)
  );

  const updatedAccount = await firstValueFrom(
    accountService.updateOneById(account_id, {
      amount: acountAmount.totalAmount,
    })
  );

  return res.status(200).json({
    ...new ResponseStrategy(200, "updated"),
  });
};

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

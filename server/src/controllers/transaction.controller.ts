import { Request, Response } from "express";
import { Filter, ObjectId } from "mongodb";
import { DbManager } from "../../bdd/db";
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

    transactionService
      .getAll(
        {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string),
        },
        filter
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

    await firstValueFrom($getAccount)
      .then((res) => {
        insertion.account_id = account_id;
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

    transactionService.createOne(insertion);

    /* $getScope
      .pipe(
        switchMap((scopeData) => {
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

          return transactionService.createOne(insertion);
        }),
        catchError((error) => {
          return throwError(
            () => new Error(error.message || "An error occurred")
          );
        })
      )
      .subscribe({
        next: (val: any) => res.status(200).send(val),
        error: (error) => Responses.BadRequest(res, error.message),
      }); */
  } catch (error: any) {
    res.status(500).json({
      ...new ResponseStrategy(500, error.toString()),
    });
  }
};

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

export const deleteTransactionById = (req: Request, res: Response) => {
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
};

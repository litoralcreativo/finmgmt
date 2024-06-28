import { Request, Response, NextFunction } from "express";
import { BSON, Filter, ObjectId } from "mongodb";
import { z } from "zod";
import { DbManager } from "../bdd/db";
import { Account, AccountRequestDTO } from "../models/account.model";
import { AccountAcumulator } from "../models/accountAcumulator.model";
import { ResponseStrategy } from "../models/response.model";
import { AccountService } from "../services/account.service";
import { TransactionService } from "../services/transaction.service";

let accountService: AccountService;
DbManager.getInstance().subscribe((x) => {
  if (x) accountService = new AccountService(x);
});

let transactionService: TransactionService;
DbManager.getInstance().subscribe((x) => {
  if (x) transactionService = new TransactionService(x);
});

export const getByUser = (req: Request, res: Response) => {
  try {
    let userId: string = (req.user as any)?.id;

    const filter: Filter<Account> = { user_id: userId };

    accountService
      .getAll(
        {
          page: 0,
          pageSize: 1000,
        },
        filter
      )
      .subscribe((val) => {
        res.status(200).json(val.elements);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...new ResponseStrategy(500, "Internal server error"),
    });
  }
};

export const create = (req: Request, res: Response) => {
  try {
    const userId: string = (req.user as any)?.id;
    let dto: Account = req.body;
    dto = {
      ...req.body,
      user_id: userId,
      favorite: false,
      created: new Date(),
      amount: 0,
    };
    accountService.createOne(dto).subscribe((val: any) =>
      res.status(200).json({
        ...new ResponseStrategy(200, "OK"),
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...new ResponseStrategy(500, "Internal server error"),
    });
  }
};

export const getById = (req: Request, res: Response) => {
  try {
    let userId: string = (req.user as any)?.id;
    const { id } = req.params;

    const filter: Filter<Account> = {
      user_id: userId,
      _id: new ObjectId(id),
    };

    accountService.getSingle(filter).subscribe((val) => {
      if (val) return res.status(200).json(val);
      else
        return res.status(404).json({
          ...new ResponseStrategy(404, "Item not found"),
        });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...new ResponseStrategy(500, "Internal server error"),
    });
  }
};

export const setFavorite = (req: Request, res: Response) => {
  try {
    let userId: string = (req.user as any)?.id;
    const { id } = req.params;
    const { favorite } = req.body;

    const filter: Filter<Account> = {
      user_id: userId,
      _id: new ObjectId(id),
    };
    accountService
      .updateOne(filter, { favorite: favorite })
      .subscribe((val) => {
        if (val) return res.status(200).json(val);
        else
          return res.status(404).json({
            ...new ResponseStrategy(404, "Item not found"),
          });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...new ResponseStrategy(500, "Internal server error"),
    });
  }
};

export const getAccountAmountsByCategory = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { year, month } = req.query;
    let from: Date = new Date();
    let to: Date = new Date();

    //#region DateRange validations
    let intYear = parseInt(year as string);
    if (!year) throw new TypeError("year is not defined");
    if (isNaN(intYear)) throw new TypeError("year is not a number");
    if (intYear < 1900 || intYear > 2100)
      throw new TypeError("year must be between 1900 and 2100");

    let intMonth = parseInt(month as string);
    if (!month) throw new TypeError("month is not defined");
    if (isNaN(intMonth)) throw new TypeError("month is not a number");
    if (intYear < 1900 || intYear > 2100)
      throw new TypeError("month must be between 0 and 11");
    //#endregion

    from = new Date(intYear, intMonth);
    to = new Date(intYear, intMonth + 1);
    to.setMinutes(to.getMinutes() - 1);

    transactionService
      .getCategoryAmountsByAccount(id, { from: from, to: to })
      .subscribe((result) => {
        const mapped: AccountAcumulator = {
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
  } catch (error) {
    if (error instanceof TypeError) {
      res.status(400).json({
        ...new ResponseStrategy(400, error.message),
      });
      return;
    }

    res.status(500).json({
      ...new ResponseStrategy(500, "Internal server error"),
    });
  }
};

export const getAccountBalanceById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    z.string().datetime().parse(from);
    if (to) {
      z.string().datetime().parse(to);
    }

    const fromDate: Date = new Date(from as "string");
    const toDate: Date = to ? new Date(to as "string") : new Date();

    transactionService
      .getAccountBalance(id, fromDate, toDate)
      .subscribe((val) => {
        return res.status(200).json(val);
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ...new ResponseStrategy(500, "Internal server error"),
    });
  }
};

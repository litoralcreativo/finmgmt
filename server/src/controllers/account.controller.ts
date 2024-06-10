import { Request, Response, NextFunction } from "express";
import { BSON, Filter, ObjectId } from "mongodb";
import { DbManager } from "../../bdd/db";
import { Account, AccountRequestDTO } from "../models/account.model";
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

/* export const getAccountAmount = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    transactionService.getAccountAmount(id).subscribe((result) => {
      return res.status(200).send(result);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...new ResponseStrategy(500, "Internal server error"),
    });
  }
}; */

import { Request, Response } from "express";
import { Filter, SortDirection } from "mongodb";
import { ZodError } from "zod";
import { DbManager } from "../bdd/db";
import { typeValidationCatch } from "../utils/typeValidationCatch";
import {
  Category,
  FinancialScope,
  FinancialScopeDTO,
  FinancialScopeDTOSchema,
} from "../models/financialScope.model";
import { ResponseStrategy } from "../models/response.model";
import {
  ScopeAcumulator,
  ScopeAcumulatorGroup,
} from "../models/scopeAcumulator.model";
import { FinancialScopeService } from "../services/financialScope.service";
import { TransactionService } from "../services/transaction.service";
import { Transaction } from "../models/transaction.model";

let financialScope: FinancialScopeService;
DbManager.getInstance().subscribe((x) => {
  if (x) financialScope = new FinancialScopeService(x);
});

let transactionService: TransactionService;
DbManager.getInstance().subscribe((x) => {
  if (x) transactionService = new TransactionService(x);
});

export const getAllScope = (req: Request, res: Response) => {
  const filter: Filter<FinancialScope> = {
    users: { $eq: (req?.user as any).id },
  };
  financialScope.getAll(undefined, filter).subscribe((val) => {
    return res.json(val);
  });
};

export const getScopeById = (req: Request, res: Response) => {
  const id = req.params.id;
  financialScope.getById(id).subscribe((val) => {
    if (!val) {
      res.status(404).json({ message: "Item not found" });
    } else {
      res.status(200).json(val);
    }
  });
};

export const getScopeAmountsByCategory = (req: Request, res: Response) => {
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
      .getCategoryAmountsByScope(id, { from: from, to: to })
      .subscribe((result) => {
        const mapped: ScopeAcumulator = {
          year: intYear,
          month: intMonth,
          groups: result.map((group) => {
            const result: ScopeAcumulatorGroup = {
              category: group._id,
              amount: group.total,
            };
            return result;
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

export const createScope = (req: Request, res: Response) => {
  try {
    const userId = (req?.user as any).id;

    const parsed = FinancialScopeDTOSchema.parse(req.body);

    const toBeCreated: Partial<FinancialScope> = {
      ...parsed,
      creator: userId,
      users: [userId],
      categories: [],
    };

    financialScope.createOne(toBeCreated).subscribe((val: any) => {
      return res.status(200).json({
        ...new ResponseStrategy(200, "Successfuly registered"),
        val,
      });
    });
  } catch (err) {
    typeValidationCatch(err as Error, res);
  }
};

export const createCategoryForScope = (req: Request, res: Response) => {
  try {
    const dto: Category = req.body;
    const id = req.params.id;

    financialScope.addCategory(id, dto).subscribe((val: any) => {
      if (val.modifiedCount !== 0) {
        return res.status(200).json({
          ...new ResponseStrategy(200, "Successfuly registered"),
          val,
        });
      } else {
        return res.status(400).json({
          ...new ResponseStrategy(
            400,
            "Category name for this scope already exist"
          ),
          val,
        });
      }
    });
  } catch (err) {
    typeValidationCatch(err as Error, res);
  }
};

export const updateCategoryForScope = (req: Request, res: Response) => {
  try {
    const dto: Category = req.body;
    const scopeId = req.params.id;
    const categoryName = req.params.catname;

    financialScope
      .updateCategory(scopeId, categoryName, dto)
      .subscribe((val: any) => {
        return res.status(200).json({
          ...new ResponseStrategy(
            200,
            val.matchedCount !== 0 ? "Successfuly updated" : "Nothing updated"
          ),
          result: val,
        });
      });
  } catch (err) {
    typeValidationCatch(err as Error, res);
  }
};

export const getTransactionsByScopeId = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { year, month, page, pageSize, description, category, user_id } = req.query;
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
    if (intMonth < 0 || intMonth > 11)
      throw new TypeError("month must be between 0 and 11");
    //#endregion

    from = new Date(intYear, intMonth);
    to = new Date(intYear, intMonth + 1);
    to.setMinutes(to.getMinutes() - 1);

    const filter: Filter<Transaction> = {
      "scope._id": id,
      date: {
        $gte: from,
        $lte: to,
      },
    };

    if (typeof description === "string") {
      filter.description = { $regex: description, $options: "i" };
    }

    if (typeof category === "string") {
      filter["scope.category.name"] = category;
    }

    if (typeof user_id === "string" && user_id.length > 0) {
      filter["user_id"] = user_id;
    }

    let dateDirection: SortDirection = -1;
    let idDirection: SortDirection = -1;
    const sort = { date: dateDirection, _id: idDirection };

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

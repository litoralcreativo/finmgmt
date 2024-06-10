import { Request, Response } from "express";
import { Filter } from "mongodb";
import { DbManager } from "../../bdd/db";
import { FinancialScope } from "../models/financialScope.model";
import { FinancialScopeService } from "../services/financialScope.service";

let financialScope: FinancialScopeService;
DbManager.getInstance().subscribe((x) => {
  if (x) financialScope = new FinancialScopeService(x);
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

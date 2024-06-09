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

/* export const createMovement = (req: Request, res: Response) => {
  const dto: MovementRequestDTO = req.body;
  financialScope
    .createOne(dto)
    .subscribe((val: any) => res.status(200).send(val));
};

export const updateMovementById = (req: Request, res: Response) => {
  const id = req.params.id;
  const dto: MovementRequestDTO = req.body;
  if (req.body._id) {
    return res
      .status(400)
      .json({ message: "Including _id in the request body is not allowed" });
  }
  financialScope.updateOneById(id, dto).subscribe((result) => {
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
};

export const deleteMovementById = (req: Request, res: Response) => {
  const id = req.params.id;
  financialScope.deleteOne(id).subscribe((result) => {
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

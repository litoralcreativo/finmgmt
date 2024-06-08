import { Request, Response } from "express";
import { Filter } from "mongodb";
import { DbManager } from "../../bdd/db";
import { FinancialSpace } from "../models/financialSpace.model";
import { FinancialSpaceService } from "../services/financialSpace.service";

let financialSpace: FinancialSpaceService;
DbManager.getInstance().subscribe((x) => {
  if (x) financialSpace = new FinancialSpaceService(x);
});

export const getAllSpaces = (req: Request, res: Response) => {
  const filter: Filter<FinancialSpace> = {
    users: { $eq: (req?.user as any).id },
  };
  financialSpace.getAll(undefined, filter).subscribe((val) => {
    return res.json(val);
  });
};

/* export const getMovementById = (req: Request, res: Response) => {
  const id = req.params.id;
  financialSpace.getById(id).subscribe((val) => {
    if (!val) {
      res.status(404).json({ message: "Item not found" });
    } else {
      res.status(200).json(val);
    }
  });
};

export const createMovement = (req: Request, res: Response) => {
  const dto: MovementRequestDTO = req.body;
  financialSpace
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
  financialSpace.updateOneById(id, dto).subscribe((result) => {
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
  financialSpace.deleteOne(id).subscribe((result) => {
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

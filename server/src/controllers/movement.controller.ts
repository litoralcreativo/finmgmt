import { Request, Response } from "express";
import { Filter } from "mongodb";
import { DbManager } from "../../bdd/db";
import { Movement, MovementRequestDTO } from "../models/movement.model";
import { PaginatedType, PaginationRequest } from "../models/pagination.model";
import { MovementService } from "../services/movement.service";

let movementService: MovementService;
DbManager.getInstance().subscribe((x) => {
  if (x) movementService = new MovementService(x);
});

export const getAllMovement = (req: Request, res: Response) => {
  // We already know this values came as string representation of integers
  // because they where validated in "validatePagination"
  let { page, pageSize } = req.query;
  let { name, description } = req.query;
  let userId: string = (req.user as any)?.id;

  const pagination: Partial<PaginationRequest> = {};

  const filter: Filter<Movement> = {};
  if (typeof name === "string") filter.nombre = { $regex: new RegExp(name) };
  if (typeof description === "string")
    filter.descripcion = { $regex: new RegExp(description) };

  movementService
    .getAll(
      {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      },
      filter
    )
    .subscribe((val) => res.json(val));
};

export const getMovementById = (req: Request, res: Response) => {
  const id = req.params.id;
  movementService.getById(id).subscribe((val) => {
    if (!val) {
      res.status(404).json({ message: "Item not found" });
    } else {
      res.status(200).json(val);
    }
  });
};

export const createMovement = (req: Request, res: Response) => {
  const dto: MovementRequestDTO = req.body;
  movementService
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
  movementService.updateOneById(id, dto).subscribe((result) => {
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
  movementService.deleteOne(id).subscribe((result) => {
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

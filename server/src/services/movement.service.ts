import { Db } from "mongodb";
import { Crud } from "../models/crud.model";
import { Movement } from "../models/movement.model";

export class MovementService extends Crud<Movement> {
  constructor(db: Db) {
    super(db, "movement");
  }
}

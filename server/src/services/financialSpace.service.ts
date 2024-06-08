import { Db } from "mongodb";
import { Crud } from "../models/crud.model";
import { FinancialSpace } from "../models/financialSpace.model";

export class FinancialSpaceService extends Crud<FinancialSpace> {
  constructor(db: Db) {
    super(db, "financial_space");
  }
}

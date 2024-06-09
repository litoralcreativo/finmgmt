import { Db } from "mongodb";
import { Crud } from "../models/crud.model";
import { FinancialScope } from "../models/financialScope.model";

export class FinancialScopeService extends Crud<FinancialScope> {
  constructor(db: Db) {
    super(db, "financial_scope");
  }
}

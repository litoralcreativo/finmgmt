import { Db } from "mongodb";
import { Crud } from "../models/crud.model";
import { Transaction } from "../models/transaction.model";

export class TransactionService extends Crud<Transaction> {
  constructor(db: Db) {
    super(db, "transaction");
  }
}

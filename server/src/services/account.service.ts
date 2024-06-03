import { Db } from "mongodb";
import { Account } from "../models/account.model";
import { Crud } from "../models/crud.model";

export class AccountService extends Crud<Account> {
  constructor(db: Db) {
    super(db, "account");
  }
}

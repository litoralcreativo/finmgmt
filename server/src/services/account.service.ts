import { Db, Document } from "mongodb";
import { catchError, from, map, Observable, switchMap } from "rxjs";
import { DbManager } from "../../bdd/db";
import { Account } from "../models/account.model";
import { Crud } from "../models/crud.model";
import { TransactionService } from "./transaction.service";

let transactionService: TransactionService;
DbManager.getInstance().subscribe((x) => {
  if (x) transactionService = new TransactionService(x);
});

export class AccountService extends Crud<Account> {
  constructor(db: Db) {
    super(db, "account");
  }

  updateAccountAmount(account_id: string): Observable<any> {
    return transactionService.getAccountAmount(account_id).pipe(
      switchMap((amount) => {
        console.log("amount: ", amount);
        return this.updateOneById(account_id, { amount: amount.totalAmount });
      })
    );
  }
}

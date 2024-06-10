import { Db, Document } from "mongodb";
import { from, map, Observable } from "rxjs";
import { Crud } from "../models/crud.model";
import { Transaction } from "../models/transaction.model";

export class TransactionService extends Crud<Transaction> {
  constructor(db: Db) {
    super(db, "transaction");
  }

  getAccountAmount(account_id: string): Observable<{ totalAmount: number }> {
    const pipeline: Document[] = [
      {
        $match: {
          account_id: account_id,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ];

    return from(
      this.collection.aggregate<{ totalAmount: number }>(pipeline)
    ).pipe(
      map((x) => {
        return x;
      })
    );
  }
}

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

  getCategoryAmountsByAccount(
    account_id: string,
    range: { from: Date; to: Date }
  ) {
    const pipeline: Document[] = [
      {
        $match: {
          account_id: account_id,
          date: {
            $gte: range.from,
            $lte: range.to,
          },
        },
      },
      {
        $group: {
          _id: "$scope",
          total: { $sum: "$amount" },
        },
      },
    ];

    return from(this.collection.aggregate<any>(pipeline).toArray()).pipe(
      map((x) => {
        return x;
      })
    );
  }

  getCategoryAmountsByScope(scope_id: string, range: { from: Date; to: Date }) {
    const pipeline: Document[] = [
      {
        $match: {
          "scope._id": scope_id,
          date: {
            $gte: range.from,
            $lte: range.to,
          },
        },
      },
      {
        $group: {
          _id: "$scope.category",
          total: { $sum: "$amount" },
        },
      },
    ];

    return from(this.collection.aggregate<any>(pipeline).toArray()).pipe(
      map((x) => {
        return x;
      })
    );
  }
}

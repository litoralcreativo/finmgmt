import { Db, Document, Filter, ObjectId, UpdateResult } from "mongodb";
import { from, map, Observable, combineLatest } from "rxjs";
import { BalanceData } from "../models/balance.model";
import { Crud } from "../models/crud.model";
import { Category } from "../models/financialScope.model";
import { Transaction } from "../models/transaction.model";

export class TransactionService extends Crud<Transaction> {
  constructor(db: Db) {
    super(db, "transaction");
  }

  getWholeAmount(
    userId: string,
    to: Date = new Date()
  ): Observable<BalanceData> {
    const endOfDay = new Date(to);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const pipeline: Document[] = [
      {
        $match: {
          user_id: userId,
          date: {
            $lt: endOfDay,
          },
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
          day: endOfDay,
          totalAmount: 1,
        },
      },
    ];

    return from(
      this.collection.aggregate<BalanceData>(pipeline).toArray()
    ).pipe(
      map((results) => {
        return results[0] || { totalAmount: 0, day: endOfDay };
      })
    );
  }

  getAccountAmount(
    account_id: string,
    to: Date = new Date()
  ): Observable<BalanceData> {
    const endOfDay = new Date(to);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const pipeline: Document[] = [
      {
        $match: {
          account_id: account_id,
          date: {
            $lt: endOfDay,
          },
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
          day: endOfDay,
          totalAmount: 1,
        },
      },
    ];

    return from(
      this.collection.aggregate<BalanceData>(pipeline).toArray()
    ).pipe(
      map((results) => {
        return results[0] || { totalAmount: 0, day: endOfDay };
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
      map((result) => {
        return result.map((x) => {
          const rounded: number = Math.round(x.total * 100) / 100;
          return { ...x, total: rounded };
        });
      })
    );
  }

  updateTransactionsCategory(
    scopeId: string,
    categoryName: string,
    newCategory: Category
  ): Observable<UpdateResult<Transaction>> {
    return from(
      this.collection.updateMany(
        {
          "scope._id": scopeId,
          "scope.category.name": categoryName,
        },
        {
          $set: {
            "scope.category.name": newCategory.name,
            "scope.category.icon": newCategory.icon,
            "scope.category.fixed": newCategory.fixed,
          },
        }
      )
    );
  }

  getAccountBalance(
    accountId: string,
    from: Date,
    to: Date = new Date()
  ): Observable<BalanceData[]> {
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    const $accountAmount = this.getAccountAmount(accountId, from);

    const filter: Filter<Transaction> = {
      account_id: accountId,
      date: { $gt: from, $lte: to },
    };

    const $accountTransactions = this.getAll(undefined, filter);

    return combineLatest([$accountAmount, $accountTransactions]).pipe(
      map(([accountAmount, accountTransactions]) => {
        const totalAmount = accountAmount.totalAmount || 0;
        const transactions = accountTransactions.elements || [];

        let currentBalance = totalAmount;
        let lastAmount = currentBalance;
        let currentDate = new Date(from);
        const balanceData: BalanceData[] = [
          {
            day: new Date(currentDate),
            totalAmount: currentBalance,
          },
        ];

        transactions.forEach((transaction) => {
          transaction.date.setHours(0, 0, 0, 0);
        });

        while (currentDate <= to) {
          const dateTransactions = transactions.filter((transaction) => {
            return transaction.date.getTime() === currentDate.getTime();
          });

          const dayVariation = dateTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
          );
          currentBalance += dayVariation;

          if (
            currentBalance !== lastAmount ||
            currentDate.getTime() === to.getTime()
          ) {
            balanceData.push({
              day: new Date(currentDate),
              totalAmount: currentBalance,
            });
            lastAmount = currentBalance;
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        return balanceData;
      })
    );
  }

  getWholeBalance(
    userId: string,
    from: Date,
    to: Date = new Date()
  ): Observable<BalanceData[]> {
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    const $accountAmount = this.getWholeAmount(userId, from);

    const filter: Filter<Transaction> = {
      date: { $gt: from, $lte: to },
    };

    const $transactions = this.getAll(undefined, filter);

    return combineLatest([$accountAmount, $transactions]).pipe(
      map(([accountAmount, accountTransactions]) => {
        const totalAmount = accountAmount.totalAmount || 0;
        const transactions = accountTransactions.elements || [];

        let currentBalance = totalAmount;
        let lastAmount = currentBalance;
        let currentDate = new Date(from);
        const balanceData: BalanceData[] = [
          {
            day: new Date(currentDate),
            totalAmount: currentBalance,
          },
        ];

        transactions.forEach((transaction) => {
          transaction.date.setHours(0, 0, 0, 0);
        });

        while (currentDate <= to) {
          const dateTransactions = transactions.filter((transaction) => {
            return transaction.date.getTime() === currentDate.getTime();
          });

          const dayVariation = dateTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
          );
          currentBalance += dayVariation;

          if (
            currentBalance !== lastAmount ||
            currentDate.getTime() === to.getTime()
          ) {
            balanceData.push({
              day: new Date(currentDate),
              totalAmount: currentBalance,
            });
            lastAmount = currentBalance;
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        return balanceData;
      })
    );
  }
}

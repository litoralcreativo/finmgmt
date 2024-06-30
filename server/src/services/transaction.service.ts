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
      map((x) => {
        return x;
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
    const $accountAmount = this.getAccountAmount(accountId, from);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    const filter: Filter<Transaction> = {
      account_id: accountId,
      date: { $gt: from, $lte: to },
    };

    const $accountTransactions = this.getAll(undefined, filter);

    return combineLatest([$accountAmount, $accountTransactions]).pipe(
      map(([accountAmount, accountTransactions]) => {
        const totalAmount = accountAmount.totalAmount || 0;
        const transactions = accountTransactions.elements || [];

        // Crear un mapa para almacenar el acumulado diario
        const balanceData: BalanceData[] = [];
        let currentDate = new Date(from);

        while (currentDate <= to) {
          balanceData.push({
            day: new Date(currentDate),
            totalAmount: 0,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        let currentBalance = totalAmount;

        balanceData.forEach((data, index) => {
          const dataDate = data.day.toISOString().split("T")[0];
          const dayTransactions = transactions.filter((transaction) => {
            transaction.date.setUTCHours(0, 0, 0, 0);
            const transactionDate = new Date(transaction.date)
              .toISOString()
              .split("T")[0];
            return transactionDate === dataDate;
          });

          const dayVariation = dayTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
          );
          currentBalance += Number(dayVariation.toFixed(2));
          data.totalAmount = currentBalance;
        });

        return balanceData;
      })
    );
  }

  getWholeBalance(
    userId: string,
    from: Date,
    to: Date = new Date()
  ): Observable<BalanceData[]> {
    const $accountAmount = this.getWholeAmount(userId, from);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    const filter: Filter<Transaction> = {
      date: { $gt: from, $lte: to },
    };

    const $transactions = this.getAll(undefined, filter);

    return combineLatest([$accountAmount, $transactions]).pipe(
      map(([accountAmount, allTransactions]) => {
        const totalAmount = accountAmount.totalAmount || 0;
        const transactions = allTransactions.elements || [];

        // Crear un mapa para almacenar el acumulado diario
        const balanceData: BalanceData[] = [];
        let currentDate = new Date(from);

        while (currentDate <= to) {
          balanceData.push({
            day: new Date(currentDate),
            totalAmount: 0,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        let currentBalance = totalAmount;

        balanceData.forEach((data, index) => {
          const dataDate = data.day.toISOString().split("T")[0];
          const dayTransactions = transactions.filter((transaction) => {
            transaction.date.setUTCHours(0, 0, 0, 0);
            const transactionDate = new Date(transaction.date)
              .toISOString()
              .split("T")[0];
            return transactionDate === dataDate;
          });

          const dayVariation = dayTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
          );
          currentBalance += Number(dayVariation.toFixed(2));
          data.totalAmount = currentBalance;
        });

        return balanceData;
      })
    );
  }
}

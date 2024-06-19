import {
  BSON,
  Db,
  Document,
  ObjectId,
  Transaction,
  UpdateFilter,
  UpdateResult,
} from "mongodb";
import { from, map, mergeMap, Observable, switchMap } from "rxjs";
import { DbManager } from "../bdd/db";
import { Crud } from "../models/crud.model";
import { Category, FinancialScope } from "../models/financialScope.model";
import { TransactionService } from "./transaction.service";

let transactionService: TransactionService;
DbManager.getInstance().subscribe((x) => {
  if (x) transactionService = new TransactionService(x);
});

export class FinancialScopeService extends Crud<FinancialScope> {
  constructor(db: Db) {
    super(db, "financial_scope");
  }

  public addCategory(
    scopeId: string,
    newCategory: Category
  ): Observable<UpdateResult<FinancialScope> | null> {
    return this.getById(scopeId).pipe(
      switchMap((scope: FinancialScope | null) => {
        if (scope?.categories.some((x) => x.name === newCategory.name)) {
          const result: UpdateResult<FinancialScope> = {
            acknowledged: true,
            modifiedCount: 0,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 1,
          };
          return from([result]);
        }
        const filter = { _id: new ObjectId(scopeId) };
        const update: UpdateFilter<FinancialScope> = {
          $push: { categories: newCategory },
        };
        return from(this.collection.updateOne(filter, update as BSON.Document));
      })
    );
  }

  public updateCategory(
    scopeId: string,
    categoryName: string,
    newCategory: Category
  ): Observable<{
    category: UpdateResult<FinancialScope>;
    transactions?: UpdateResult<Transaction>;
  }> {
    return from(
      this.collection.updateOne(
        {
          _id: new ObjectId(scopeId),
          "categories.name": categoryName,
        },
        {
          $set: {
            "categories.$.name": newCategory.name,
            "categories.$.icon": newCategory.icon,
            "categories.$.fixed": newCategory.fixed,
          },
        }
      )
    ).pipe(
      mergeMap((categoryUpdateResult) => {
        if (categoryUpdateResult.modifiedCount > 0) {
          return transactionService
            .updateTransactionsCategory(scopeId, categoryName, newCategory)
            .pipe(
              map((transactionsUpdateResult) => ({
                category: categoryUpdateResult,
                transactions: transactionsUpdateResult,
              }))
            );
        } else {
          return from([{ category: categoryUpdateResult }]);
        }
      })
    );
  }
}

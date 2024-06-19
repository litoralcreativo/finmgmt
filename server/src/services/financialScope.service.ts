import {
  BSON,
  Db,
  Document,
  ObjectId,
  UpdateFilter,
  UpdateResult,
} from "mongodb";
import { from, Observable, switchMap } from "rxjs";
import { Crud } from "../models/crud.model";
import { Category, FinancialScope } from "../models/financialScope.model";

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
  ): Observable<UpdateResult<FinancialScope>> {
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
    );
  }
}

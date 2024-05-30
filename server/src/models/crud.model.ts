import {
  BSON,
  Collection,
  Db,
  DeleteResult,
  Filter,
  ObjectId,
  UpdateResult,
} from "mongodb";
import { forkJoin, from, map, Observable } from "rxjs";
import { ObjectIdType } from "./objectid.model";
import { PaginatedType, PaginationRequest } from "./pagination.model";

export abstract class Crud<T extends BSON.Document> {
  protected collection: Collection<BSON.Document>;

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection(collectionName);
  }

  public getAll(
    pagination?: PaginationRequest,
    filter?: Filter<T>
  ): Observable<PaginatedType<T>> {
    const query = (filter || {}) as Filter<BSON.Document>;
    const skip = pagination ? pagination.page * pagination.pageSize : 0;
    const limit = pagination ? pagination.pageSize : 10;

    const getElements$ = from(
      this.collection.find<T>(query).skip(skip).limit(limit).toArray()
    );

    const getCount$ = from(this.collection.countDocuments());

    return forkJoin([getElements$, getCount$]).pipe(
      map(([elements, total]) => ({
        page: pagination ? pagination.page : 0,
        pageSize: pagination ? pagination.pageSize : limit,
        total,
        elements,
      }))
    );
  }

  public getById(id: string): Observable<T | null> {
    const filter = { _id: new ObjectId(id) };
    return from(this.collection.findOne<T>(filter));
  }

  public createOne(obj: Partial<T>): Observable<ObjectIdType | null> {
    return from(this.collection.insertOne(obj as any)).pipe(
      map((x) => {
        return x.acknowledged ? x.insertedId.toHexString() : null;
      })
    );
  }

  public updateOne(id: string, obj: Partial<T>): Observable<UpdateResult<T>> {
    const filter = { _id: new ObjectId(id) };
    const update = { $set: obj };
    return from(this.collection.updateOne(filter, update));
  }

  public deleteOne(id: string): Observable<DeleteResult> {
    const filter = { _id: new ObjectId(id) };
    return from(this.collection.deleteOne(filter));
  }
}

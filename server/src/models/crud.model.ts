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
import {
  CountedList,
  PaginatedType,
  PaginationRequest,
} from "./pagination.model";

export abstract class Crud<T extends BSON.Document> {
  protected collection: Collection<BSON.Document>;

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection(collectionName);
  }

  public getAll(
    pagination?: PaginationRequest,
    filter?: Filter<T>
  ): Observable<PaginatedType<T> | CountedList<T>> {
    const query = (filter || {}) as Filter<BSON.Document>;

    let getElements$;

    // If the request doesn't need pagination
    if (!pagination) {
      return (getElements$ = from(
        this.collection.find<T>(query).toArray()
      ).pipe(
        map((elements) => {
          return {
            total: elements.length,
            elements,
          };
        })
      ));
    }

    // Otherwise

    const skip = pagination ? pagination.page * pagination.pageSize : 0;
    const limit = pagination ? pagination.pageSize : 10;

    getElements$ = from(
      this.collection.find<T>(query).skip(skip).limit(limit).toArray()
    );

    const getCount$ = from(this.collection.countDocuments(query));

    return forkJoin([getElements$, getCount$]).pipe(
      map(([elements, total]) => ({
        page: pagination ? pagination.page : 0,
        pageSize: pagination ? pagination.pageSize : limit,
        total,
        elements,
      }))
    );
  }

  public getSingle(filter?: Filter<T>) {
    const query = (filter || {}) as Filter<BSON.Document>;
    return from(this.collection.findOne<T>(query));
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

  public updateOne(
    filter: Filter<T>,
    obj: Partial<T>
  ): Observable<UpdateResult<T>> {
    const query = (filter || {}) as Filter<BSON.Document>;
    const update = { $set: obj };
    return from(this.collection.updateOne(query, update));
  }

  public updateOneById(
    id: string,
    obj: Partial<T>
  ): Observable<UpdateResult<T>> {
    const filter = { _id: new ObjectId(id) };
    const update = { $set: obj };
    return from(this.collection.updateOne(filter, update));
  }

  public deleteOne(id: string): Observable<DeleteResult> {
    const filter = { _id: new ObjectId(id) };
    return from(this.collection.deleteOne(filter));
  }
}

import { Db } from "mongodb";
import { from } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { Crud } from "../models/crud.model";
import { User } from "../models/user.model";

export class UserService extends Crud<User> {
  constructor(db: Db) {
    super(db, "user");
  }

  public getByEmail(email: string): Observable<User | null> {
    const filter = { email: email };
    return from(this.collection.findOne<User>(filter));
  }
}

import { MongoClient, Db } from "mongodb";
import { BehaviorSubject, from, map } from "rxjs";
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const dbName = process.env.DB_NAME || "finmgmt";

const client = new MongoClient(uri);

export namespace DbManager {
  const _instance: BehaviorSubject<Db | null> = new BehaviorSubject<Db | null>(
    null
  );

  const connectToDB = (): void => {
    // Return if there is an instance
    if (_instance.getValue()) return;

    from(client.connect())
      .pipe(
        map((con) => {
          return client.db(dbName);
        })
      )
      .subscribe({
        next: (db) => {
          console.log("Connection to MongoDB established successfully");
          _instance.next(db);
        },
        error: (err) => {
          console.log(process.env.MONGODB_URI);
          console.error("Error connecting to MongoDB:", err);
          throw err;
        },
      });
  };

  export const getInstance = (): BehaviorSubject<Db | null> => {
    return _instance;
  };

  connectToDB();
}

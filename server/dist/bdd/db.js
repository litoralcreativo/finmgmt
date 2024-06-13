"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbManager = void 0;
const mongodb_1 = require("mongodb");
const rxjs_1 = require("rxjs");
require("dotenv").config();
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const dbName = process.env.DB_NAME || "finmgmt";
const client = new mongodb_1.MongoClient(uri);
var DbManager;
(function (DbManager) {
    const _instance = new rxjs_1.BehaviorSubject(null);
    const connectToDB = () => {
        // Return if there is an instance
        if (_instance.getValue())
            return;
        (0, rxjs_1.from)(client.connect())
            .pipe((0, rxjs_1.map)((con) => {
            return client.db(dbName);
        }))
            .subscribe({
            next: (db) => {
                console.log("Connection to MongoDB established successfully");
                _instance.next(db);
            },
            error: (err) => {
                console.error("Error connecting to MongoDB:", err);
                throw err;
            },
        });
    };
    DbManager.getInstance = () => {
        return _instance;
    };
    connectToDB();
})(DbManager || (exports.DbManager = DbManager = {}));

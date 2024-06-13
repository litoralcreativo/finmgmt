"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crud = void 0;
const mongodb_1 = require("mongodb");
const rxjs_1 = require("rxjs");
class Crud {
    constructor(db, collectionName) {
        this.collection = db.collection(collectionName);
    }
    getAll(pagination, filter, sort = {}) {
        const query = (filter || {});
        let getElements$;
        // If the request doesn't need pagination
        if (!pagination) {
            return (getElements$ = (0, rxjs_1.from)(this.collection.find(query).toArray()).pipe((0, rxjs_1.map)((elements) => {
                return {
                    total: elements.length,
                    elements,
                };
            })));
        }
        // Otherwise
        const skip = pagination ? pagination.page * pagination.pageSize : 0;
        const limit = pagination ? pagination.pageSize : 10;
        getElements$ = (0, rxjs_1.from)(this.collection
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .toArray());
        const getCount$ = (0, rxjs_1.from)(this.collection.countDocuments(query));
        return (0, rxjs_1.forkJoin)([getElements$, getCount$]).pipe((0, rxjs_1.map)(([elements, total]) => ({
            page: pagination ? pagination.page : 0,
            pageSize: pagination ? pagination.pageSize : limit,
            total,
            elements,
        })));
    }
    getSingle(filter) {
        const query = (filter || {});
        return (0, rxjs_1.from)(this.collection.findOne(query));
    }
    getById(id) {
        const filter = { _id: new mongodb_1.ObjectId(id) };
        return (0, rxjs_1.from)(this.collection.findOne(filter));
    }
    createOne(obj) {
        return (0, rxjs_1.from)(this.collection.insertOne(obj)).pipe((0, rxjs_1.map)((x) => {
            return x.acknowledged ? x.insertedId.toHexString() : null;
        }));
    }
    updateOne(filter, obj) {
        const query = (filter || {});
        const update = { $set: obj };
        return (0, rxjs_1.from)(this.collection.updateOne(query, update));
    }
    updateOneById(id, obj) {
        const filter = { _id: new mongodb_1.ObjectId(id) };
        const update = { $set: obj };
        return (0, rxjs_1.from)(this.collection.updateOne(filter, update));
    }
    deleteOne(id) {
        const filter = { _id: new mongodb_1.ObjectId(id) };
        return (0, rxjs_1.from)(this.collection.deleteOne(filter));
    }
}
exports.Crud = Crud;

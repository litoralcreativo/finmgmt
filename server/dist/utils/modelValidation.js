"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidType = void 0;
function isValidType(k, obj) {
    const keys = Object.keys(obj);
    for (const key of k) {
        if (obj[key] === undefined) {
            return false;
        }
    }
    return true;
}
exports.isValidType = isValidType;

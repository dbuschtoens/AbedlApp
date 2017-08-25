"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function omit(object, ...keys) {
    let result = {};
    for (let key in object) {
        if (keys.indexOf(key) === -1) {
            result[key] = object[key];
        }
    }
    return result;
}
exports.omit = omit;

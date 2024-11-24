"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asPromisedValue = exports.promisedValue = void 0;
const promisedValue = (val) => {
    let promiseResolve;
    let promiseReject;
    const promise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
    });
    return Object.assign(promise, {
        $promisedValueResolve: promiseResolve,
        $promisedValueReject: promiseReject,
        $promisedValue: val,
    });
};
exports.promisedValue = promisedValue;
const asPromisedValue = (value) => {
    let v = value;
    let resolve;
    let reject;
    if (typeof (value === null || value === void 0 ? void 0 : value.then) === 'function' &&
        '$promisedValue' in value &&
        '$promisedValueResolve' in value &&
        '$promisedValueReject' in value) {
        v = value.$promisedValue;
        resolve = value.$promisedValueResolve;
        reject = value.$promisedValueReject;
    }
    return { value: v, resolve, reject };
};
exports.asPromisedValue = asPromisedValue;
exports.default = exports.promisedValue;
//# sourceMappingURL=promisedValue.js.map
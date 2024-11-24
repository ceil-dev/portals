"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const microenv_1 = require("@ceil-dev/microenv");
const promisedValue_1 = require("../promisedValue");
const enter = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, portal, payload: remoteId }) {
    portal('ether.attach');
    const { envDescriptor } = yield portal('remote.enter', { id: remoteId });
    return (0, microenv_1.default)({}, envDescriptor, {
        get: ({ key, descriptor, obj, next }) => {
            if ((typeof descriptor.type === 'object' &&
                descriptor.type.extends === 'function') ||
                descriptor.type === 'function') {
                return (payload) => __awaiter(void 0, void 0, void 0, function* () {
                    return portal('remote.call', {
                        recipient: remoteId,
                        key,
                        value: payload,
                    });
                });
            }
            const res = portal('remote.get', {
                recipient: remoteId,
                key,
                next,
            });
            if (res instanceof Promise) {
                res.then((r) => (obj[key] = r));
            }
            return res;
        },
        set: (_a) => __awaiter(void 0, [_a], void 0, function* ({ key, value, obj }) {
            const { value: v, resolve, reject } = (0, promisedValue_1.asPromisedValue)(value);
            try {
                const res = yield portal('remote.set', {
                    recipient: remoteId,
                    key,
                    value: v,
                });
                obj[key] = value;
                resolve === null || resolve === void 0 ? void 0 : resolve(res);
            }
            catch (e) {
                reject === null || reject === void 0 ? void 0 : reject(e);
            }
        }),
    });
});
exports.default = enter;
//# sourceMappingURL=enter.js.map
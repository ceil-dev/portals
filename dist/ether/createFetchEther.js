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
exports.createFetchEther = void 0;
const createClientEther_1 = require("./createClientEther");
const createFetchEther = ({ endpoint, fetchMethod, strategy, }) => {
    const send = (data, signal) => __awaiter(void 0, void 0, void 0, function* () {
        if (typeof data !== 'string') {
            console.warn('fetch ether > send: unsupported data format. Only supporting "string" at the moment.');
            return;
        }
        let abortController = new AbortController();
        signal.onAbort = () => {
            abortController === null || abortController === void 0 ? void 0 : abortController.abort();
            abortController = undefined;
        };
        const res = yield fetchMethod(endpoint, {
            method: 'POST',
            body: data,
            signal: abortController.signal,
        });
        if (!res.ok)
            throw new Error('Fetch: Failed sending data');
        return yield res.text();
    });
    return (0, createClientEther_1.createClientEther)(send, strategy);
};
exports.createFetchEther = createFetchEther;
//# sourceMappingURL=createFetchEther.js.map
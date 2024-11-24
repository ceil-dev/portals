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
exports.createClientEther = void 0;
const getTimeoutFromAttempts = (attempts) => {
    const x = Math.min(attempts / 20, 1);
    return 60000 * (-Math.sqrt(1 - x * x) + 1);
};
const createClientEther = (send, strategy) => {
    const _portals = {};
    let activeRequests = 0;
    let activeTimeout;
    let isDetached = true;
    let signal = {};
    return {
        'ether.attach': ({ id, portal }) => {
            _portals[id] = portal;
            isDetached = false;
        },
        'ether.send': (_a) => __awaiter(void 0, [_a], void 0, function* ({ portal, payload }) {
            var _b;
            if (signal) {
                (_b = signal.onAbort) === null || _b === void 0 ? void 0 : _b.call(signal);
                signal = undefined;
            }
            if (isDetached)
                return false;
            const { payload: data, recipient } = payload;
            let numAttempts = 0;
            signal = {};
            const _send = () => __awaiter(void 0, void 0, void 0, function* () {
                numAttempts++;
                try {
                    const res = yield send(data, signal);
                    signal = undefined;
                    if (isDetached)
                        return false;
                    return res;
                }
                catch (e) {
                    if (isDetached || (e === null || e === void 0 ? void 0 : e.name) === 'AbortError')
                        return false;
                    yield new Promise((resolve) => (activeTimeout = setTimeout(resolve, getTimeoutFromAttempts(numAttempts))));
                    return _send();
                }
            });
            activeRequests++;
            const receivedData = yield _send();
            activeRequests--;
            receivedData && portal('receive', receivedData);
            if (strategy === 'poll' && !activeRequests && receivedData !== false)
                portal('queue', ['dispatch', recipient]);
        }),
        'ether.detach': ({ portal }) => {
            var _a;
            isDetached = true;
            clearTimeout(activeTimeout);
            activeTimeout = undefined;
            (_a = signal === null || signal === void 0 ? void 0 : signal.onAbort) === null || _a === void 0 ? void 0 : _a.call(signal);
            signal = undefined;
        },
    };
};
exports.createClientEther = createClientEther;
//# sourceMappingURL=createClientEther.js.map
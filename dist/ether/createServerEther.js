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
exports.createServerEther = void 0;
const createServerEther = () => {
    const resolversByRecipient = {};
    let isAttached = false;
    return (superMethods) => ({
        'ether.attach': () => {
            isAttached = true;
        },
        'ether.detach': () => {
            isAttached = false;
        },
        $superReceive: superMethods.receive,
        receive: (_a) => __awaiter(void 0, [_a], void 0, function* ({ portal, payload }) {
            if (!isAttached) {
                console.warn('Server Ether -> tried to receive when detached');
                return;
            }
            const res = yield portal('$superReceive', payload);
            if (!(res === null || res === void 0 ? void 0 : res.sender))
                return;
            return new Promise((resolve, reject) => {
                var _a;
                (_a = resolversByRecipient[res.sender]) === null || _a === void 0 ? void 0 : _a.resolve(undefined);
                resolversByRecipient[res.sender] = { resolve, reject };
            });
        }),
        'ether.send': (_a) => __awaiter(void 0, [_a], void 0, function* ({ payload }) {
            var _b;
            if (!isAttached) {
                console.warn('Server Ether -> tried to "ether.send" when detached');
                return;
            }
            const { recipient, payload: payloadToSend } = payload;
            (_b = resolversByRecipient[recipient]) === null || _b === void 0 ? void 0 : _b.resolve(payloadToSend);
        }),
    });
};
exports.createServerEther = createServerEther;
//# sourceMappingURL=createServerEther.js.map
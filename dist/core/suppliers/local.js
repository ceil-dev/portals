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
const enter = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, env, portal, payload }) {
    var _b;
    if (id !== payload.id) {
        throw 'Unauthorised';
    }
    portal('guest', { id: payload.sender });
    return {
        id,
        envDescriptor: Object.assign(Object.assign({}, env.descriptor), { children: (_b = env.descriptor.children) === null || _b === void 0 ? void 0 : _b.filter((ch) => !ch.private) }),
    };
});
const restart = (_a) => __awaiter(void 0, [_a], void 0, function* ({ portal, payload }) {
    yield portal('queue', ['reset', payload.sender]);
    portal('ether.restart', { recipient: payload.sender });
});
const leave = () => {
    console.warn('"leave" supplier is not implemented');
};
const get = ({ env, payload }) => {
    return env.get(payload.key, payload.sender, payload.next);
};
const set = ({ env, payload }) => {
    return env.set(payload.key, payload.value, payload.sender);
};
const call = ({ env, payload }) => env.get(payload.key)(payload.value, {
    sender: payload.sender,
    localEnv: env,
});
const local = {
    'local.restart': restart,
    'local.enter': enter,
    'local.leave': leave,
    'local.get': get,
    'local.set': set,
    'local.call': call,
};
exports.default = local;
//# sourceMappingURL=local.js.map
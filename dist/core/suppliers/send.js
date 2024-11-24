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
exports.createSendSupplier = void 0;
const createSendSupplier = () => {
    return (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, portal, payload }) {
        const { recipient, payload: p } = payload;
        const finalPayload = yield portal('packager.pack', {
            sender: id,
            payload: p,
        });
        portal('ether.send', {
            recipient,
            payload: finalPayload,
        }).catch(console.warn);
    });
};
exports.createSendSupplier = createSendSupplier;
//# sourceMappingURL=send.js.map
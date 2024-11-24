"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptoSupplier = void 0;
const randomUUID_1 = require("../randomUUID");
const cryptoSupplier = () => {
    if (!randomUUID_1.randomUUID)
        throw 'Crypto is not implemented. Provide as middleware';
    return {
        randomUUID: randomUUID_1.randomUUID,
    };
};
exports.cryptoSupplier = cryptoSupplier;
//# sourceMappingURL=cryptoSupplier.js.map
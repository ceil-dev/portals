"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomUUID = void 0;
let _crypto;
try {
    _crypto = globalThis.crypto || require('crypto');
}
catch (err) {
    console.error('crypto support is disabled!');
}
if (_crypto && !_crypto.randomUUID)
    _crypto.randomUUID = () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^
        (_crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
const randomUUID = () => { var _a; return (_a = _crypto === null || _crypto === void 0 ? void 0 : _crypto.randomUUID) === null || _a === void 0 ? void 0 : _a.call(_crypto); };
exports.randomUUID = randomUUID;
//# sourceMappingURL=randomUUID.js.map
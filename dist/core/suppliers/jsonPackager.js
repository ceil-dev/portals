"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonPackager = void 0;
const pack = ({ payload }) => JSON.stringify(payload);
const unpack = ({ payload }) => typeof payload === 'string' ? JSON.parse(payload) : [];
exports.jsonPackager = {
    'packager.pack': pack,
    'packager.unpack': unpack,
};
//# sourceMappingURL=jsonPackager.js.map
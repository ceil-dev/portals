"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocalPortal = void 0;
const core_1 = require("../core/");
const createLocalPortal = (env, localEther, middleware) => {
    const portal = (0, core_1.createPortal)(env, [localEther, middleware]);
    return portal;
};
exports.createLocalPortal = createLocalPortal;
//# sourceMappingURL=index.js.map
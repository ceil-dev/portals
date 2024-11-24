"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerPortal = void 0;
const core_1 = require("../core");
const ether_1 = require("../ether");
const createServerPortal = (env, middleware) => {
    return (0, core_1.createPortal)(env, [(0, ether_1.createServerEther)(), middleware]);
};
exports.createServerPortal = createServerPortal;
//# sourceMappingURL=index.js.map
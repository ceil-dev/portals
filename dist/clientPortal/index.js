"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientPortal = void 0;
const core_1 = require("../core");
const createClientEther_1 = require("./../ether/createClientEther");
const createClientPortal = ({ env, send, middleware, strategy, }) => {
    return (0, core_1.createPortal)(env, [(0, createClientEther_1.createClientEther)(send, strategy), middleware]);
};
exports.createClientPortal = createClientPortal;
//# sourceMappingURL=index.js.map
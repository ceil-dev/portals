"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const open = ({ portal }) => {
    portal('ether.attach');
    portal('queue', ['process']);
};
exports.default = open;
//# sourceMappingURL=open.js.map
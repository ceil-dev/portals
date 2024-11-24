"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withMiddleware = (suppliers, middleware) => {
    if (typeof middleware === 'function') {
        return Object.assign(Object.assign({}, suppliers), middleware(suppliers));
    }
    if (Array.isArray(middleware)) {
        return middleware.reduce((res, m) => {
            return withMiddleware(res, m);
        }, suppliers);
    }
    if (typeof middleware === 'object') {
        return Object.assign(Object.assign({}, suppliers), middleware);
    }
    return suppliers;
};
exports.default = withMiddleware;
//# sourceMappingURL=withMiddleware.js.map
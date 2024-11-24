"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init = ({ id, env }, { demand, getSupplierTypes }) => {
    const hasDebug = getSupplierTypes().includes('debug');
    let depth = 1;
    const portal = (hasDebug
        ? (action, payload) => {
            demand({
                key: 'debug',
                type: 'debug',
                data: [`[portal ${id}]`, '··'.repeat(depth), action, payload],
            });
            depth++;
            const result = demand({
                key: action,
                type: action,
                data: { id, env, portal, payload },
            });
            depth--;
            demand({
                key: 'debug',
                type: 'debug',
                data: [
                    `[portal ${id}]`,
                    '··'.repeat(depth),
                    action,
                    'resolved as',
                    result,
                ],
            });
            return result;
        }
        : (action, payload) => demand({
            key: action,
            type: action,
            data: { id, env, portal, payload: payload },
        }));
    return portal;
};
exports.default = init;
//# sourceMappingURL=init.js.map
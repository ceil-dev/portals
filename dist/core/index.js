"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPortal = void 0;
const withMiddleware_1 = require("./withMiddleware");
const init_1 = require("./suppliers/init");
const local_1 = require("./suppliers/local");
const remote_1 = require("./suppliers/remote");
const open_1 = require("./suppliers/open");
const close_1 = require("./suppliers/close");
const enter_1 = require("./suppliers/enter");
const leave_1 = require("./suppliers/leave");
const jsonPackager_1 = require("./suppliers/jsonPackager");
const send_1 = require("./suppliers/send");
const receive_1 = require("./suppliers/receive");
const guest_1 = require("./suppliers/guest");
const cryptoSupplier_1 = require("./suppliers/cryptoSupplier");
const persistence_1 = require("@ceil-dev/persistence");
const supply_demand_1 = require("@ceil-dev/supply-demand");
const ether_1 = require("./suppliers/ether");
const queue_1 = require("./suppliers/queue");
const createPortal = (env, middleware) => {
    const id = env.descriptor.id;
    if (!id) {
        throw new Error('createPortal: given env has no id in descriptor');
    }
    const suppliers = (0, withMiddleware_1.default)(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ init: init_1.default }, ether_1.ether), local_1.default), remote_1.default), { open: open_1.default,
        close: close_1.default,
        enter: enter_1.default,
        leave: leave_1.default,
        guest: guest_1.default }), jsonPackager_1.jsonPackager), { send: (0, send_1.createSendSupplier)(), receive: receive_1.default, queue: (0, supply_demand_1.synchronous)((0, queue_1.createQueueSupplier)({ outgoingBufferMs: 200 })), crypto: cryptoSupplier_1.cryptoSupplier }), middleware);
    if (!('persistence' in suppliers)) {
        suppliers.persistence = (0, persistence_1.createPersistenceSupplier)({
            id,
            defaultData: {},
        });
    }
    return (0, supply_demand_1.supplyDemand)((_, { demand }) => {
        const portal = demand({
            type: 'init',
            data: { id, env },
        });
        return portal;
    }, suppliers);
};
exports.createPortal = createPortal;
//# sourceMappingURL=index.js.map
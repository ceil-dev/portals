"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestsSupplier = void 0;
const createRequestsSupplier = () => {
    return (_a, _b) => __awaiter(void 0, [_a, _b], void 0, function* ({ id, payload: props }, { demand }) {
        var _c, _d;
        const persistence = demand({ type: 'persistence' });
        const requestsData = (((_c = (yield persistence.get({ key: id + '.requests' }))) === null || _c === void 0 ? void 0 : _c.value) || {});
        const { indices = {}, remoteReqLastIndices = {}, syncs = {}, } = requestsData;
        let { queue = [] } = requestsData;
        const { reset } = props;
        if (reset) {
            if (reset.remoteId === '*') {
                yield persistence.delete({
                    key: id + '.requests',
                });
                return;
            }
            queue = queue.filter((req) => req.recipient !== reset.remoteId);
            delete indices[reset.remoteId];
            delete remoteReqLastIndices[reset.remoteId];
            delete syncs[reset.remoteId];
            yield persistence.set({
                key: id + '.requests',
                value: {
                    queue,
                    indices,
                    remoteReqLastIndices,
                    syncs,
                },
            });
            return;
        }
        const persist = () => {
            return persistence.set({
                key: id + '.requests',
                value: {
                    queue,
                    indices,
                    remoteReqLastIndices,
                    syncs,
                },
            });
        };
        if (!props)
            return queue;
        const { add, get, remove, sync, getLastRequestIndex } = props;
        if (getLastRequestIndex) {
            const result = remoteReqLastIndices[getLastRequestIndex.recipient] || 0;
            return result;
        }
        if (sync) {
            const { sender, queue: incomingQueue } = sync;
            let index = sync.sync;
            syncs[sender] || (syncs[sender] = 0);
            if (index >= syncs[sender])
                syncs[sender] = index;
            else {
                if (index === 0) {
                    remoteReqLastIndices[sender] = 0;
                    indices[sender] = 0;
                    syncs[sender] = 0;
                    queue = queue.filter((req) => req.recipient !== sender);
                }
                index = syncs[sender];
            }
            queue = queue.filter((req) => {
                return req.recipient !== sender || !!req.resolve || req.index > index;
            });
            let lastIndex = remoteReqLastIndices[sender] || 0;
            if (((_d = incomingQueue[0]) === null || _d === void 0 ? void 0 : _d.index) > lastIndex + 1) {
                indices[sender] = lastIndex = incomingQueue[0].index - 1;
            }
            const result = incomingQueue.filter((req) => {
                if (req.index === lastIndex + 1) {
                    lastIndex++;
                    return true;
                }
                if (lastIndex === 0) {
                }
            });
            remoteReqLastIndices[sender] = lastIndex;
            yield persist();
            return result;
        }
        if (add) {
            const index = (indices[add.recipient] =
                (indices[add.recipient] || 0) + 1);
            const a = id + '-req-' + index;
            queue.push(Object.assign(Object.assign({}, add), { index, id: a + add.id }));
            yield persist();
        }
        if (remove) {
            const index = queue.findIndex((req) => {
                if ((req === null || req === void 0 ? void 0 : req.id) === remove.id) {
                    return true;
                }
            });
            index !== -1 && queue.splice(index, 1);
        }
        if (get) {
            const getKeys = Object.keys(get);
            return queue.filter((req) => !!req &&
                (!!get.id || req.index > (syncs[req.recipient] || 0)) &&
                getKeys.every((key) => {
                    return req[key] === get[key];
                }));
        }
        yield persist();
        return queue;
    });
};
exports.createRequestsSupplier = createRequestsSupplier;
//# sourceMappingURL=requests.js.map
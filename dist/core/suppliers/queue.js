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
exports.createQueueSupplier = void 0;
const createQueueSupplier = ({ outgoingBufferMs, }) => {
    const resolvables = new Map();
    const sendTimeouts = new Map();
    let processTimeout;
    const addResolvable = (entryId) => {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
            resolve = (v) => {
                resolvables.delete(entryId);
                res(v);
            };
            reject = (e) => {
                resolvables.delete(entryId);
                rej(e);
            };
        });
        const resolvable = { id: entryId, promise, resolve, reject };
        resolvables.set(entryId, resolvable);
        return resolvable;
    };
    return (_a, _b) => __awaiter(void 0, [_a, _b], void 0, function* ({ id: localId, payload: [op, data], portal }, { demand }) {
        var _c, _d;
        const persistence = demand({ type: 'persistence' });
        const crypto = demand({ type: 'crypto' });
        const persistenceKey = localId + '.queue';
        let { queue, syncs, enterIds } = ((_c = (yield persistence.get({ key: persistenceKey }))) === null || _c === void 0 ? void 0 : _c.value) || { syncs: {}, enterIds: {}, queue: [] };
        const persist = () => persistence.set({
            key: persistenceKey,
            value: { syncs, queue, enterIds },
        });
        const scheduleDispatch = (recipient) => {
            if (!sendTimeouts.get(recipient))
                sendTimeouts.set(recipient, setTimeout(() => {
                    sendTimeouts.delete(recipient);
                    portal('queue', ['dispatch', recipient]);
                }, outgoingBufferMs));
        };
        if (op === 'out') {
            const { recipient, action, payload, keep } = data;
            for (let i = 0; i < queue.length; i++) {
                const entry = queue[i];
                if (keep &&
                    entry.action === data.action &&
                    entry.recipient === data.recipient) {
                    if (entry.result && 'value' in entry.result)
                        return { result: entry.result.value };
                    const pendingResolvable = resolvables.get(entry.id);
                    if (pendingResolvable)
                        return { result: pendingResolvable.promise };
                    const resolvable = addResolvable(entry.id);
                    scheduleDispatch(recipient);
                    return { result: resolvable.promise };
                }
            }
            if (!syncs[localId + '<>' + recipient])
                syncs[localId + '<>' + recipient] = 0;
            const entryIndex = ++syncs[localId + '<>' + recipient];
            const entryUUID = crypto.randomUUID();
            const entryId = JSON.stringify([
                localId,
                recipient,
                action,
                entryIndex,
                entryUUID,
            ]);
            if (action === 'enter') {
                enterIds[localId + '<>' + recipient] = entryId;
            }
            const newEntry = {
                id: entryId,
                index: entryIndex,
                sender: localId,
                recipient,
                action,
                payload,
                keep,
            };
            const resolvable = addResolvable(newEntry.id);
            if (action === 'resolve') {
                const index = queue.findIndex((e) => e.sender === recipient && e.id === (payload === null || payload === void 0 ? void 0 : payload.id));
                if (index !== -1) {
                    (_d = resolvables.get(queue[index].id)) === null || _d === void 0 ? void 0 : _d.resolve(undefined);
                    queue.splice(index, 1);
                }
            }
            queue.push(newEntry);
            scheduleDispatch(recipient);
            yield persist();
            return { result: resolvable.promise };
        }
        else if (op === 'in') {
            const { sync, sender, queue: incomingQueue } = data;
            const sendersToSkip = [];
            for (const entry of incomingQueue) {
                if (entry.recipient === localId) {
                    if (entry.action === 'enter' &&
                        entry.index === 1 &&
                        (enterIds[entry.sender] || syncs[entry.sender]) &&
                        entry.id !== enterIds[entry.sender]) {
                        console.warn(localId, '🚨 ? REMOTE RESTARTED ? 🚨', sender);
                        queue.forEach((e) => {
                            var _a, _b;
                            if (e.sender === entry.sender || e.recipient === entry.sender) {
                                e.removed = true;
                                e.synced = true;
                                e.action === 'resolve'
                                    ? (_a = resolvables.get(e.id)) === null || _a === void 0 ? void 0 : _a.resolve(undefined)
                                    : (_b = resolvables.get(e.id)) === null || _b === void 0 ? void 0 : _b.reject('______Restarted!_____');
                            }
                        });
                        enterIds[entry.sender] = entry.id;
                        syncs[entry.sender] = 0;
                        syncs[localId + '<>' + entry.sender] = 0;
                    }
                    if (!sendersToSkip.includes(entry.sender) &&
                        entry.action !== 'enter' &&
                        !enterIds[localId + '<>' + entry.sender]) {
                        if (sender !== entry.sender) {
                            sendersToSkip.push(entry.sender);
                            continue;
                        }
                        else {
                            enterIds[localId + '<>' + entry.sender] = '---restored---';
                            syncs[sender] = entry.index - 1;
                            syncs[localId + '<>' + entry.sender] = sync;
                        }
                    }
                    if (entry.index !== (syncs[entry.sender] || 0) + 1) {
                        continue;
                    }
                }
                syncs[entry.sender] = entry.index;
                queue.push(entry);
            }
            if (sync) {
                queue = queue.filter((e) => {
                    var _a;
                    if (e.removed)
                        return;
                    if (e.sender === localId &&
                        e.recipient === sender &&
                        e.index <= sync) {
                        e.synced = true;
                        if (e.action === 'resolve') {
                            (_a = resolvables.get(e.id)) === null || _a === void 0 ? void 0 : _a.resolve(undefined);
                        }
                    }
                    return true;
                });
            }
            yield persist();
            if (!processTimeout)
                processTimeout = setTimeout(() => {
                    processTimeout = undefined;
                    portal('queue', ['process']);
                }, 200);
        }
        else if (op === 'process') {
            for (let i = 0; i < queue.length; i++) {
                const entry = queue[i];
                if (entry.recipient === localId && entry.sender !== localId) {
                    if (!entry.synced) {
                        if (entry.action === 'resolve') {
                            const { value, error } = entry.payload;
                            const id = entry.payload.id;
                            const resolvable = resolvables.get(id);
                            if (!resolvable) {
                                console.warn(`portal > queue: received resolve for unknown queue entry ID "${id}"`, entry.id);
                                entry.synced = true;
                            }
                            else {
                                const entryIndex = queue.findIndex((e) => e.id === id);
                                const localEntry = queue[entryIndex];
                                if (localEntry) {
                                    if (!localEntry.keep) {
                                        queue.splice(entryIndex, 1);
                                        if (entryIndex <= i)
                                            i--;
                                    }
                                    else if (!error)
                                        localEntry.result = { value };
                                }
                                entry.synced = true;
                                if (error)
                                    resolvable.reject(error);
                                else
                                    resolvable.resolve(value);
                            }
                        }
                        else {
                            const localAction = `local.${entry.action}`;
                            const callLocalSupplier = () => __awaiter(void 0, void 0, void 0, function* () {
                                var _a;
                                let value;
                                let error;
                                try {
                                    value = yield portal(localAction, Object.assign(Object.assign({}, entry.payload), { sender: entry.sender }));
                                }
                                catch (e) {
                                    error = (_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e;
                                }
                                portal('queue', [
                                    'out',
                                    {
                                        sender: localId,
                                        recipient: entry.sender,
                                        action: 'resolve',
                                        payload: { id: entry.id, value, error },
                                    },
                                ]);
                            });
                            entry.synced = true;
                            addResolvable(entry.id).promise.catch(console.warn);
                            callLocalSupplier().catch(console.warn);
                        }
                    }
                    else {
                        if (!resolvables.get(entry.id)) {
                            entry.synced = true;
                            portal('queue', [
                                'out',
                                {
                                    sender: localId,
                                    recipient: entry.sender,
                                    action: 'resolve',
                                    payload: { id: entry.id, error: 'Remote restarted.' },
                                },
                            ]);
                        }
                    }
                }
                else if (entry.sender === localId) {
                    scheduleDispatch(entry.recipient);
                }
                else if (entry.recipient !== localId) {
                    console.warn(`queue: incoming queue entry recipient "${entry.recipient}" is not the local environment. Routing is not supported yet. Rejecting.`);
                    portal('queue', [
                        'out',
                        {
                            sender: entry.recipient,
                            recipient: entry.sender,
                            action: 'resolve',
                            payload: { id: entry.id, error: 'Unknown recipient.' },
                        },
                    ]);
                }
            }
            queue = queue.filter((e) => {
                var _a;
                if (!(e.action === 'resolve' && e.synced)) {
                    return true;
                }
                (_a = resolvables.get(e.id)) === null || _a === void 0 ? void 0 : _a.resolve(undefined);
            });
            yield persist();
        }
        else if (op === 'dispatch') {
            if (!data) {
                console.warn('queue: tried to dispatch without specifying recipient');
                return;
            }
            const recipient = data;
            const outgoingQueue = [];
            for (const entry of queue) {
                if (entry.synced)
                    continue;
                if (entry.recipient !== recipient)
                    continue;
                outgoingQueue.push({
                    id: entry.id,
                    index: entry.index,
                    sender: entry.sender,
                    recipient: entry.recipient,
                    action: entry.action,
                    payload: entry.payload,
                });
            }
            portal('send', {
                recipient,
                payload: {
                    sync: syncs[recipient] || 0,
                    queue: outgoingQueue,
                },
            });
        }
        else if (op === 'reset') {
            const remoteId = data;
            queue = queue.filter((e) => {
                var _a;
                if (e.sender !== remoteId && e.recipient !== remoteId) {
                    return true;
                }
                delete syncs[localId + '<>' + remoteId];
                delete syncs[remoteId];
                (_a = resolvables.get(e.id)) === null || _a === void 0 ? void 0 : _a.reject('Queue has been reset.');
            });
            yield persist();
        }
    });
};
exports.createQueueSupplier = createQueueSupplier;
//# sourceMappingURL=queue.js.map
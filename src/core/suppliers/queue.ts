import { QueueEntry, QueueOutEntry, QueueSupplier } from '../types';

type ResolveApi = {
  id: string;
  promise: Promise<any>;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
};

type QueueStorageObject = {
  syncs: { [k: string]: number };
  enterIds: { [k: string]: string };
  queue: QueueEntry[];
};

export const createQueueSupplier = ({
  outgoingBufferMs,
}: {
  outgoingBufferMs?: number;
}): QueueSupplier => {
  const resolvables: Map<string, ResolveApi> = new Map();
  const sendTimeouts: Map<string, NodeJS.Timeout> = new Map();
  let processTimeout: NodeJS.Timeout;

  const addResolvable = (entryId: string): ResolveApi => {
    let resolve: (val: unknown) => void;
    let reject: (err: unknown) => void;

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

    const resolvable: ResolveApi = { id: entryId, promise, resolve, reject };
    resolvables.set(entryId, resolvable);

    return resolvable;
  };

  return async ({ id: localId, payload: [op, data], portal }, { demand }) => {
    const persistence = demand({ type: 'persistence' });
    const crypto = demand({ type: 'crypto' });
    const persistenceKey = localId + '.queue';

    let { queue, syncs, enterIds }: QueueStorageObject = ((
      await persistence.get({ key: persistenceKey })
    )?.value as any) || { syncs: {}, enterIds: {}, queue: [] };

    const persist = () =>
      persistence.set({
        key: persistenceKey,
        value: { syncs, queue, enterIds },
      });

    const scheduleDispatch = (recipient: string) => {
      if (!sendTimeouts.get(recipient))
        sendTimeouts.set(
          recipient,
          setTimeout(() => {
            sendTimeouts.delete(recipient);
            portal('queue', ['dispatch', recipient]);
          }, outgoingBufferMs)
        );
    };

    if (op === 'out') {
      const { recipient, action, payload, keep } = data;

      for (let i = 0; i < queue.length; i++) {
        const entry = queue[i];

        if (
          keep &&
          entry.action === data.action &&
          entry.recipient === data.recipient
        ) {
          if (entry.result && 'value' in entry.result)
            // result is known
            return { result: entry.result.value };

          const pendingResolvable = resolvables.get(entry.id);
          if (pendingResolvable)
            // result is pending
            return { result: pendingResolvable.promise };

          // abandoned entry - reusing
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

      const newEntry: QueueEntry = {
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
        const index = queue.findIndex(
          (e) => e.sender === recipient && e.id === payload?.id
        );
        if (index !== -1) {
          resolvables.get(queue[index].id)?.resolve(undefined);
          queue.splice(index, 1);
        }
      }
      queue.push(newEntry);

      scheduleDispatch(recipient);

      await persist();

      return { result: resolvable.promise };
    } else if (op === 'in') {
      const { sync, sender, queue: incomingQueue } = data;

      const sendersToSkip: string[] = [];

      for (const entry of incomingQueue as QueueEntry[]) {
        // console.log('🚨', localId, '<>', sender, {
        //   sync,
        //   entry: { ...entry },
        //   [entry.sender]: syncs[entry.sender],
        //   [localId + '<>' + entry.sender]: syncs[localId + '<>' + entry.sender],
        //   enterIds: { ...enterIds },
        // });

        if (entry.recipient === localId) {
          if (
            entry.action === 'enter' &&
            entry.index === 1 &&
            (enterIds[entry.sender] || syncs[entry.sender]) &&
            entry.id !== enterIds[entry.sender]
          ) {
            console.warn(localId, '🚨 ? REMOTE RESTARTED ? 🚨', sender);

            queue.forEach((e) => {
              // console.log('🚨 Cleaning up entry:', e.id, e.action, e);

              if (e.sender === entry.sender || e.recipient === entry.sender) {
                e.removed = true;
                e.synced = true;
                e.action === 'resolve'
                  ? resolvables.get(e.id)?.resolve(undefined)
                  : resolvables.get(e.id)?.reject('______Restarted!_____');
              }
            });

            enterIds[entry.sender] = entry.id;
            syncs[entry.sender] = 0;
            syncs[localId + '<>' + entry.sender] = 0;
          }

          if (
            !sendersToSkip.includes(entry.sender) &&
            entry.action !== 'enter' &&
            !enterIds[localId + '<>' + entry.sender]
          ) {
            // console.warn(localId, '🚨 ? LOCAL RESTARTED ? 🚨', entry, {
            //   syncs: { ...syncs },
            //   enterIds: { ...enterIds },
            // });
            if (sender !== entry.sender) {
              // TODO: support routing eventually
              sendersToSkip.push(entry.sender);
              continue;
            } else {
              enterIds[localId + '<>' + entry.sender] = '---restored---'; // just to let the local know that it's okay to process this sender's entries
              syncs[sender] = entry.index - 1;
              syncs[localId + '<>' + entry.sender] = sync;
            }
          }

          if (entry.index !== (syncs[entry.sender] || 0) + 1) {
            // console.warn(
            //   'skipping incoming queue entry - index is behind or ahead -',
            //   entry.index,
            //   syncs[entry.sender],
            //   entry.id
            // );

            continue;
          }
        }

        syncs[entry.sender] = entry.index;

        queue.push(entry);
      }

      if (sync) {
        // console.log('>>>', localId, 'syncing');

        queue = queue.filter((e) => {
          if (e.removed) return;

          if (
            e.sender === localId &&
            e.recipient === sender &&
            e.index <= sync
          ) {
            e.synced = true;
            if (e.action === 'resolve') {
              resolvables.get(e.id)?.resolve(undefined);
            }
          }

          return true;
        });
      }

      await persist();

      if (!processTimeout)
        processTimeout = setTimeout(() => {
          processTimeout = undefined;
          portal('queue', ['process']);
        }, 200);
      // }
    } else if (op === 'process') {
      for (let i = 0; i < queue.length; i++) {
        const entry = queue[i];

        if (entry.recipient === localId && entry.sender !== localId) {
          if (!entry.synced) {
            if (entry.action === 'resolve') {
              const { value, error } = entry.payload;
              const id = entry.payload.id as string;

              const resolvable = resolvables.get(id);

              if (!resolvable) {
                console.warn(
                  `portal > queue: received resolve for unknown queue entry ID "${id}"`,
                  entry.id
                );
                entry.synced = true;
              } else {
                const entryIndex = queue.findIndex((e) => e.id === id);
                const localEntry = queue[entryIndex];

                if (localEntry) {
                  if (!localEntry.keep) {
                    queue.splice(entryIndex, 1);
                    if (entryIndex <= i) i--; // fixing iteration since modified the iterated array
                  } else if (!error) localEntry.result = { value };
                }

                entry.synced = true;

                if (error) resolvable.reject(error);
                else resolvable.resolve(value);
              }
            } else {
              const localAction = `local.${entry.action}` as const;

              const callLocalSupplier = async () => {
                let value: unknown;
                let error: unknown;

                // in case the call is not async and it fails
                try {
                  value = await portal(localAction, {
                    ...entry.payload,
                    sender: entry.sender,
                  });
                } catch (e) {
                  error = e?.message ?? e;
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
              };

              entry.synced = true;
              addResolvable(entry.id).promise.catch(console.warn); // just to keep somthing in runtime to know that the execution is active

              // "branching out" to proceed with main function execution
              callLocalSupplier().catch(console.warn);
            }
          } else {
            if (!resolvables.get(entry.id)) {
              // The entry has no connection to runtime, local has restarted
              // console.log(localId, '🚨 DETECTED ABANDONED ENTRY! 🚨', entry);

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
        } else if (entry.sender === localId) {
          scheduleDispatch(entry.recipient);
        } else if (entry.recipient !== localId) {
          console.warn(
            `queue: incoming queue entry recipient "${entry.recipient}" is not the local environment. Routing is not supported yet. Rejecting.`
          );

          portal('queue', [
            'out',
            {
              sender: entry.recipient, // TODO: Hmmm...
              recipient: entry.sender,
              action: 'resolve',
              payload: { id: entry.id, error: 'Unknown recipient.' },
            },
          ]);
        }
      }

      queue = queue.filter((e) => {
        if (!(e.action === 'resolve' && e.synced)) {
          return true;
        }

        resolvables.get(e.id)?.resolve(undefined);
      });

      await persist();
    } else if (op === 'dispatch') {
      if (!data) {
        console.warn('queue: tried to dispatch without specifying recipient');
        return;
      }
      const recipient = data;

      // if (!queue.length) return;

      const outgoingQueue: QueueOutEntry[] = [];

      for (const entry of queue) {
        if (entry.synced) continue;
        if (entry.recipient !== recipient) continue;

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
          queue: outgoingQueue, //.sort((a, b) => a.index - b.index),
        },
      });
    } else if (op === 'reset') {
      const remoteId = data;
      queue = queue.filter((e) => {
        if (e.sender !== remoteId && e.recipient !== remoteId) {
          return true;
        }
        delete syncs[localId + '<>' + remoteId];
        delete syncs[remoteId];
        resolvables.get(e.id)?.reject('Queue has been reset.');
      });

      await persist();
    }

    // console.log(
    //   localId,
    //   '... RESULTING DATA ...',
    //   [...queue],
    //   { ...syncs },
    //   resolvables
    // );
  };
};

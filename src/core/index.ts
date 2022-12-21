import createEnv, { MicroEnv } from 'microenv';
import supplyDemand, { Supplier, Suppliers } from 'supply-demand';
import { Portal, PromisedValue } from '../types';

const ifResolveValue = (value: PromisedValue | any) => {
  let v = value;
  let resolve;
  let reject;
  if (
    typeof value?.then === 'function' &&
    '$promisedValue' in value &&
    '$promisedValueResolve' in value &&
    '$promisedValueReject' in value
  ) {
    v = value.$promisedValue;
    resolve = value.$promisedValueResolve;
    reject = value.$promisedValueReject;
  }

  return { value: v, resolve, reject };
};

const remote: Supplier = ({ portal, payload }, { type: action }) => {
  const [, act] = action.split('.');
  const { recipient, err, key, value } = payload;
  return portal('send', {
    recipient,
    payload: { action: act, payload: { err, key, value } },
  });
};

const initRequests = () => {
  const reqObj = {
    reqs: {},
    reqId: -1,
  };

  return (props: { incrementId: boolean }) => {
    if (props.incrementId) reqObj.reqId++;
    return reqObj;
  };
};

const defaultSuppliers: Suppliers = {
  $requests: initRequests(),
  open: undefined,
  close: undefined,
  enter: async ({ portal, payload }) => {
    const remoteEnvDescriptor = await portal('remote.getEnvDescriptor', {
      recipient: payload,
    });
    console.log('enter:', remoteEnvDescriptor);
    return createEnv({}, remoteEnvDescriptor, {
      get: ({ key, descriptor, obj }) => {
        if (descriptor.type === 'function')
          return async (...args: any[]) =>
            portal('remote.call', {
              recipient: payload,
              key,
              value: args,
            });
        return portal('remote.get', { recipient: payload, key });
      },
      set: async ({ key, value }) => {
        const { value: v, resolve, reject } = ifResolveValue(value);
        try {
          const res = await portal('remote.set', {
            recipient: payload,
            key,
            value: v,
          });
          resolve?.(res);
        } catch (e) {
          reject?.(e);
        }
      },
    });
  },
  leave: undefined,
  'local.getEnvDescriptor': ({ env }) => env.descriptor,
  'local.get': ({ env, payload }) => env.get(payload.key),
  'local.set': ({ env, payload }) => {
    // TODO: asynchronicity
    return env.set(payload.key, payload.value);
  },
  'local.call': ({ env, payload }) => env.get(payload.key)(...payload.value),
  'local.reply': ({ payload }, { demand }) => {
    const { reqs } = demand({ key: 'requests', type: '$requests' });
    if (payload.err) return reqs[payload.key].reject(new Error(payload.err));
    return reqs[payload.key].resolve(payload.value);
  },

  send: async ({ id, portal, payload }, { demand }) => {
    const { recipient, payload: p } = payload;
    const { reqs, reqId } = demand({
      key: 'requests',
      type: '$requests',
      data: { incrementId: true },
    });
    const promise = new Promise((resolve, reject) => {
      reqs[reqId] = { resolve, reject };
    });
    const data = await portal('packager.pack', {
      reqId,
      sender: id,
      payload: p,
    });
    portal('dispatch', { recipient, payload: data }).catch((e: any) =>
      console.log(e)
    );
    return promise;
  },
  receive: async ({ portal, payload }) => {
    const data = await portal('packager.unpack', payload);
    const { sender, reqId: incomingReqId, payload: incomingPayload } = data;

    (async () => {
      const { action, payload: payloadToReceive } = incomingPayload;
      let res;
      let err;
      try {
        res = await portal('local.' + action, payloadToReceive);
      } catch (e: any) {
        err = e?.message || e;
      }
      action !== 'reply' &&
        portal('remote.reply', {
          recipient: sender,
          err,
          key: incomingReqId,
          value: res,
        }).catch((e: any) => console.log(e));
    })().catch((e) => console.log(e));

    return { sender, payload: incomingPayload };
  },

  'remote.getEnvDescriptor': remote,
  'remote.reply': remote,
  'remote.get': remote,
  'remote.set': remote,
  'remote.call': remote,

  'packager.pack': ({ payload }) => JSON.stringify(payload),
  'packager.unpack': ({ payload }) => JSON.parse(payload),
};

export const createPortal = (
  id: string,
  env: MicroEnv,
  middleware: Suppliers | ((s: Suppliers) => Suppliers)
) => {
  if (typeof middleware === 'function')
    middleware = middleware(defaultSuppliers);

  return supplyDemand(
    (data, { demand }) => {
      const portal: Portal = (action, payload) =>
        demand({
          key: action,
          type: action,
          data: { id, portal, env, payload },
        });
      return portal;
    },
    {
      ...defaultSuppliers,
      ...middleware,
    }
  );
};

export const promisedValue = (val: any): PromisedValue => {
  let promiseResolve: (value: any) => any;
  let promiseReject: (reason: any) => any;

  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;
  });

  const extendedPromise = Object.assign(promise, {
    $promisedValueResolve: promiseResolve!,
    $promisedValueReject: promiseReject!,
    $promisedValue: val,
  });

  return extendedPromise;
};

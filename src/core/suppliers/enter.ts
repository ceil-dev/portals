import createEnv from '@ceil-dev/microenv';
import { asPromisedValue } from '../promisedValue';
import { EnterSupplier, Serializable } from '../types';

const enter: EnterSupplier = async ({ id, portal, payload: remoteId }) => {
  // await portal('requests', { reset: { remoteId: recipient } });

  portal('ether.attach'); // TODO: does it belong here?

  const { envDescriptor } = await portal('remote.enter', { id: remoteId });

  return createEnv({}, envDescriptor, {
    get: ({ key, descriptor, obj, next }) => {
      if (
        (typeof descriptor.type === 'object' &&
          descriptor.type.extends === 'function') ||
        descriptor.type === 'function'
      ) {
        return async (payload: Serializable) =>
          portal('remote.call', {
            recipient: remoteId,
            key,
            value: payload,
          });
      }

      const res = portal('remote.get', {
        recipient: remoteId,
        key,
        next,
      });
      if (res instanceof Promise) {
        res.then((r) => (obj[key] = r));
      }

      return res;
    },
    set: async ({ key, value, obj }) => {
      const { value: v, resolve, reject } = asPromisedValue(value);
      try {
        const res = await portal('remote.set', {
          recipient: remoteId,
          key,
          value: v,
        });
        obj[key] = value;
        resolve?.(res);
      } catch (e) {
        reject?.(e);
      }
    },
  });
};

export default enter;

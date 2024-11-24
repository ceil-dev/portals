import {
  LocalCallSupplier,
  LocalEnterSupplier,
  LocalGetSupplier,
  LocalLeaveSupplier,
  LocalRestartSupplier,
  LocalSetSupplier,
  LocalSuppliers,
} from '../types';

const enter: LocalEnterSupplier = async ({ id, env, portal, payload }) => {
  if (id !== payload.id) {
    throw 'Unauthorised';
  }

  portal('guest', { id: payload.sender });

  return {
    id,
    envDescriptor: {
      ...env.descriptor,
      children: env.descriptor.children?.filter((ch) => !ch.private),
    },
  };
};

const restart: LocalRestartSupplier = async ({ portal, payload }) => {
  await portal('queue', ['reset', payload.sender]);
  portal('ether.restart', { recipient: payload.sender });
};

const leave: LocalLeaveSupplier = () => {
  console.warn('"leave" supplier is not implemented');
};

const get: LocalGetSupplier = ({ env, payload }) => {
  return env.get(payload.key, payload.sender, payload.next);
};

const set: LocalSetSupplier = ({ env, payload }) => {
  // TODO: asynchronicity
  return env.set(payload.key, payload.value, payload.sender);
};

const call: LocalCallSupplier = ({ env, payload }) =>
  env.get(payload.key)(payload.value, {
    sender: payload.sender,
    localEnv: env,
  });

const local: LocalSuppliers = {
  'local.restart': restart,
  'local.enter': enter,
  'local.leave': leave,
  'local.get': get,
  'local.set': set,
  'local.call': call,
};

export default local;

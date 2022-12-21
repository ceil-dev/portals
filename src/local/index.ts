import { createPortal } from '../core';
import { MicroEnv } from 'microenv';

const _portals: Record<string, any> = {};

const local = (id: string, env: MicroEnv) => {
  if (!id) id = Math.random().toString();

  const portal = createPortal(id, env, {
    dispatch: async ({ data: { payload } }) => {
      const { recipient, payload: payloadToReceive } = payload;
      const remotePortal = _portals[recipient];
      return remotePortal('receive', payloadToReceive);
    },
  });

  id && (_portals[id] = portal);

  return portal;
};

export default local;

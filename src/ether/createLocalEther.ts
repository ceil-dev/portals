import { EtherMiddleware, PortalMethod } from '../core/types';

export const createLocalEther = (): EtherMiddleware => {
  const _portals: Record<string, PortalMethod> = {};

  return {
    'ether.attach': ({ id, portal }) => {
      _portals[id] = portal;
    },
    'ether.send': async ({ payload }) => {
      const { recipient, payload: payloadToReceive } = payload;

      let attempts = 1;
      while (attempts) {
        const remotePortal = _portals[recipient];

        // TODO: fail eventually?
        if (!remotePortal) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        remotePortal('receive', payloadToReceive);
        break;
      }
    },
    'ether.detach': ({ id, portal }) => {
      delete _portals[id];
    },
  };
};

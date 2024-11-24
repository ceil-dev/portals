import { EtherMiddleware, PortalMethod } from '../core/types';

type AbortSignal = { onAbort?: () => void };

export type OutsideSendMethod = (data: unknown, signal: AbortSignal) => unknown;

export type CommunicationStrategy = 'poll';

const getTimeoutFromAttempts = (attempts: number) => {
  const x = Math.min(attempts / 20, 1);

  // return 60000 * (Math.sin((x - 0.5) * Math.PI) * 0.5 + 0.5);
  return 60000 * (-Math.sqrt(1 - x * x) + 1);
};

export const createClientEther = (
  send: OutsideSendMethod,
  strategy?: CommunicationStrategy
): EtherMiddleware => {
  const _portals: Record<string, PortalMethod> = {};
  let activeRequests = 0;

  let activeTimeout: NodeJS.Timeout | undefined;
  let isDetached = true;

  let signal: AbortSignal | undefined = {};

  return {
    'ether.attach': ({ id, portal }) => {
      _portals[id] = portal;
      isDetached = false;
    },
    'ether.send': async ({ portal, payload }) => {
      // console.log('>>>>> ether.send >>>>>', payload);

      if (signal) {
        signal.onAbort?.();
        signal = undefined;
      }
      if (isDetached) return false; // TODO: actually may need to fail or hang until back to "attached state"

      const { payload: data, recipient } = payload;
      let numAttempts = 0;
      signal = {};

      const _send = async (): Promise<unknown> => {
        numAttempts++;
        try {
          const res = await send(data, signal);
          signal = undefined;
          if (isDetached) return false;
          return res;
        } catch (e) {
          // console.log(`failed`, e, `... numAttempts: ${numAttempts}`);
          if (isDetached || e?.name === 'AbortError') return false;
          await new Promise(
            (resolve) =>
              (activeTimeout = setTimeout(
                resolve,
                getTimeoutFromAttempts(numAttempts)
              ))
          );
          return _send();
        }
      };

      activeRequests++;
      const receivedData = await _send();
      activeRequests--;

      receivedData && portal('receive', receivedData);

      if (strategy === 'poll' && !activeRequests && receivedData !== false)
        portal('queue', ['dispatch', recipient]);
    },
    'ether.detach': ({ portal }) => {
      isDetached = true;
      clearTimeout(activeTimeout);
      activeTimeout = undefined;
      signal?.onAbort?.();
      signal = undefined;
    },
  };
};

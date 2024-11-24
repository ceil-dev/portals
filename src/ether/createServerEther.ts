import { EtherMiddleware } from '../core/types';

type Resolver = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

export const createServerEther = (): EtherMiddleware => {
  const resolversByRecipient: Record<string, Resolver> = {};
  let isAttached = false;

  return (superMethods) => ({
    'ether.attach': () => {
      isAttached = true;
    },
    'ether.detach': () => {
      isAttached = false;
    },
    $superReceive: superMethods.receive,
    receive: async ({ portal, payload }) => {
      if (!isAttached) {
        console.warn('Server Ether -> tried to receive when detached');
        return;
      }

      const res = await portal('$superReceive' as 'receive', payload);

      if (!res?.sender) return;

      return new Promise((resolve, reject) => {
        resolversByRecipient[res.sender]?.resolve(undefined);
        resolversByRecipient[res.sender] = { resolve, reject };
      });
    },
    'ether.send': async ({ payload }) => {
      if (!isAttached) {
        console.warn('Server Ether -> tried to "ether.send" when detached');
        return;
      }

      const { recipient, payload: payloadToSend } = payload;

      resolversByRecipient[recipient]?.resolve(payloadToSend);
    },
  });
};

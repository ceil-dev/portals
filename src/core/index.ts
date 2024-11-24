import {
  CoreSuppliers,
  Middleware,
  PersistenceSupplier,
  PortalMethod,
} from './types';
import withMiddleware from './withMiddleware';
import init from './suppliers/init';
import local from './suppliers/local';
import remote from './suppliers/remote';
import open from './suppliers/open';
import close from './suppliers/close';
import enter from './suppliers/enter';
import leave from './suppliers/leave';
import { jsonPackager } from './suppliers/jsonPackager';
import { createSendSupplier } from './suppliers/send';
import receive from './suppliers/receive';
import guest from './suppliers/guest';
import { cryptoSupplier } from './suppliers/cryptoSupplier';
import { createPersistenceSupplier } from '@ceil-dev/persistence';
import { supplyDemand, synchronous } from '@ceil-dev/supply-demand';
import { ether } from './suppliers/ether';
import { MicroEnv } from '@ceil-dev/microenv';
import { createQueueSupplier } from './suppliers/queue';

export const createPortal = (
  env: MicroEnv,
  middleware?: Middleware | (Middleware | undefined)[]
): PortalMethod => {
  const id = env.descriptor.id;

  if (!id) {
    throw new Error('createPortal: given env has no id in descriptor');
  }

  const suppliers = withMiddleware<
    Omit<CoreSuppliers, 'persistence'> & { persistence?: PersistenceSupplier }
  >(
    {
      init,
      ...ether,
      ...local,
      ...remote,
      open,
      close,
      enter,
      leave,
      guest,
      ...jsonPackager,
      send: createSendSupplier(),
      receive,
      queue: synchronous(createQueueSupplier({ outgoingBufferMs: 200 })),
      crypto: cryptoSupplier,
    },
    middleware
  );

  if (!('persistence' in suppliers)) {
    suppliers.persistence = createPersistenceSupplier({
      id,
      defaultData: {},
    });
  }

  return supplyDemand((_, { demand }): PortalMethod => {
    const portal = demand({
      type: 'init',
      data: { id, env },
    });

    return portal;
  }, suppliers);
};

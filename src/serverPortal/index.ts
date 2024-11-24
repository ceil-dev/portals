import { MicroEnv } from '@ceil-dev/microenv';
import { createPortal } from '../core';
import { Middleware } from '../core/types';
import { createServerEther } from '../ether';

// Use this portal if the technology can only send data as a reply
export const createServerPortal = (env: MicroEnv, middleware?: Middleware) => {
  return createPortal(env, [createServerEther(), middleware]);
};

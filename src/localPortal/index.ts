import { MicroEnv } from '@ceil-dev/microenv';
import { createPortal } from '../core/';
import { EtherMiddleware, Middleware } from '../core/types';

export const createLocalPortal = (
  env: MicroEnv,
  localEther: EtherMiddleware,
  middleware?: Middleware
) => {
  const portal = createPortal(env, [localEther, middleware]);

  return portal;
};

import { Middleware, PortalMethod } from './types';
import { MicroEnv } from '@ceil-dev/microenv';
export declare const createPortal: (env: MicroEnv, middleware?: Middleware | (Middleware | undefined)[]) => PortalMethod;

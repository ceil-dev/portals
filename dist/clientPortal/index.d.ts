import { Middleware } from '../core/types';
import { MicroEnv } from '../index';
import { CommunicationStrategy, OutsideSendMethod } from './../ether/createClientEther';
type ClientPortalProps = {
    id?: string;
    env: MicroEnv;
    send: OutsideSendMethod;
    middleware?: Middleware;
    strategy?: CommunicationStrategy;
};
export declare const createClientPortal: ({ env, send, middleware, strategy, }: ClientPortalProps) => import("../index").PortalMethod;
export {};

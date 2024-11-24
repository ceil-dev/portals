import { EtherMiddleware } from '../core/types';
type AbortSignal = {
    onAbort?: () => void;
};
export type OutsideSendMethod = (data: unknown, signal: AbortSignal) => unknown;
export type CommunicationStrategy = 'poll';
export declare const createClientEther: (send: OutsideSendMethod, strategy?: CommunicationStrategy) => EtherMiddleware;
export {};

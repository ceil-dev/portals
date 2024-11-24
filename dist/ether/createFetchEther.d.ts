import { FetchLike } from '@ceil-dev/persistence';
import { CommunicationStrategy } from './createClientEther';
import { EtherMiddleware } from '../core/types';
type FetchEtherProps = {
    endpoint: string;
    fetchMethod: FetchLike;
    strategy?: CommunicationStrategy;
};
export declare const createFetchEther: ({ endpoint, fetchMethod, strategy, }: FetchEtherProps) => EtherMiddleware;
export {};

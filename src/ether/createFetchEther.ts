import { FetchLike } from '@ceil-dev/persistence';
import {
  CommunicationStrategy,
  createClientEther,
  OutsideSendMethod,
} from './createClientEther';
import { EtherMiddleware } from '../core/types';

type FetchEtherProps = {
  endpoint: string;
  fetchMethod: FetchLike;
  strategy?: CommunicationStrategy;
};

export const createFetchEther = ({
  endpoint,
  fetchMethod,
  strategy,
}: FetchEtherProps): EtherMiddleware => {
  const send: OutsideSendMethod = async (data, signal) => {
    // console.log('Fetch Ether > send:', endpoint, data);

    if (typeof data !== 'string') {
      console.warn(
        'fetch ether > send: unsupported data format. Only supporting "string" at the moment.'
      );

      return;
    }

    let abortController = new AbortController();

    signal.onAbort = () => {
      abortController?.abort();
      abortController = undefined;
    };

    const res = await fetchMethod(endpoint, {
      method: 'POST',
      body: data,
      signal: abortController.signal,
    });

    if (!res.ok) throw new Error('Fetch: Failed sending data');

    return await res.text();
  };

  return createClientEther(send, strategy);
};

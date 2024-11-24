import { createPortal } from '../core';
import { Middleware } from '../core/types';
import { MicroEnv } from '../index';
import {
  CommunicationStrategy,
  createClientEther,
  OutsideSendMethod,
} from './../ether/createClientEther';

type ClientPortalProps = {
  id?: string;
  env: MicroEnv;
  send: OutsideSendMethod;
  middleware?: Middleware;
  strategy?: CommunicationStrategy;
};

export const createClientPortal = ({
  env,
  send,
  middleware,
  strategy,
}: ClientPortalProps) => {
  return createPortal(env, [createClientEther(send, strategy), middleware]);
};

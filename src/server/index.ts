import { createPortal } from '../core';
import { MicroEnv } from 'microenv';

const serverPortal = (id: string, env: MicroEnv) => {
  const responsePromisesByRecipient: Record<string, any> = {};

  return createPortal(id, env, (superMethods) => ({
    $superReceive: superMethods.receive,
    receive: async ({ portal, payload }) => {
      const { sender } = await portal('$superReceive', payload);
      return new Promise((resolve, reject) => {
        responsePromisesByRecipient[sender] = { resolve, reject };
      });
    },
    dispatch: async ({ payload }) => {
      const { recipient, payload: payloadToSend } = payload;

      // // TODO: remove mocked delay
      // await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))

      responsePromisesByRecipient[recipient].resolve(payloadToSend);
      return;
    },
  }));
};

export default serverPortal;

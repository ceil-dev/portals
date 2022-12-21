import { createPortal } from '../core';
import { MicroEnv } from 'microenv';

const clientPortal = (
  id: string,
  env: MicroEnv,
  send: (address: string, data: any) => any
) => {
  return createPortal(id, env, {
    dispatch: async ({ portal, payload }) => {
      const { recipient: address, payload: data } = payload;
      let numAttempts = 0;
      const _send = async (): Promise<any> => {
        numAttempts++;
        try {
          const res = await send(address, data);
          return res;
        } catch (e) {
          await new Promise((resolve) =>
            setTimeout(resolve, 100 + 100 * numAttempts * numAttempts)
          );
          return _send();
        }
      };
      return portal('receive', await _send());
    },
  });
};

export default clientPortal;

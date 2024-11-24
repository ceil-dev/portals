import { SendSupplier } from '../types';

export const createSendSupplier = (): SendSupplier => {
  return async ({ id, portal, payload }) => {
    const { recipient, payload: p } = payload;

    const finalPayload = await portal('packager.pack', {
      sender: id,
      payload: p,
    });

    portal('ether.send', {
      recipient,
      payload: finalPayload,
    }).catch(console.warn);
  };
};

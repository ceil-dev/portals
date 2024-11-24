import { ReceiveSupplier } from '../types';

const receive: ReceiveSupplier = async ({ portal, payload }) => {
  const data = await portal('packager.unpack', payload);

  const { sender, payload: receivedPayload } = data;
  portal('queue', ['in', { sender, ...receivedPayload }]);

  return { sender };
};

export default receive;

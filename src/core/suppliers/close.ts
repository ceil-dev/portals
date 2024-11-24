import { CloseSupplier } from '../types';

const close: CloseSupplier = ({ portal }) => {
  portal('ether.detach');

  console.warn('"close" supplier may not be fully implemented yet');
};

export default close;

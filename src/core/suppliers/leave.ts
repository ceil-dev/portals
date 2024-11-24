import { LeaveSupplier } from '../types';

const leave: LeaveSupplier = ({ portal }) => {
  portal('ether.detach'); // TODO: does it belong here?

  // console.warn('"leave" supplier may not be fully implemented');
};

export default leave;

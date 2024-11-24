import { OpenSupplier } from '../types';

const open: OpenSupplier = ({ portal }) => {
  portal('ether.attach');
  portal('queue', ['process']);

  // console.warn('"open" supplier may not be fully implemented yet');
};

export default open;

import { EtherSuppliers } from '../types';

export const ether: EtherSuppliers = {
  'ether.attach': () =>
    console.warn('"ether.attach" supplier is not implemented'),
  'ether.restart': () =>
    console.warn('"ether.restart" supplier is not implemented'),
  'ether.send': () => console.warn('"ether.send" supplier is not implemented'),
  'ether.detach': () =>
    console.warn('"ether.detach" supplier is not implemented'),
};

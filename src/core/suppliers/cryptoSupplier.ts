import { randomUUID } from '../randomUUID';
import { CryptoSupplier } from '../types';

export const cryptoSupplier: CryptoSupplier = () => {
  if (!randomUUID) throw 'Crypto is not implemented. Provide as middleware';
  return {
    randomUUID,
  };
};

import { PackagerPackSupplier, PackagerUnpackSupplier } from '../types';

const pack: PackagerPackSupplier = ({ payload }) => JSON.stringify(payload);
const unpack: PackagerUnpackSupplier = ({ payload }) =>
  typeof payload === 'string' ? JSON.parse(payload) : [];

export const jsonPackager = {
  'packager.pack': pack,
  'packager.unpack': unpack,
};

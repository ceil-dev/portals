import {
  EnterSupplierReturn,
  GenericRemoteSupplier,
  RemoteEnterSupplier,
  RemoteSuppliers,
} from '../types';

// const remoteSync: Supplier = ({ portal, payload }) => {
//   const { recipient } = payload;
//   return portal('send', { recipient });
// };

const remoteEnterSupplier: RemoteEnterSupplier = ({ portal, payload }) => {
  const { id: remoteId } = payload;

  return portal('queue', [
    'out',
    {
      recipient: remoteId,
      action: 'enter',
      payload: { id: remoteId },
      // keep: true,
    },
  ]) as any as EnterSupplierReturn;
};

const remoteSupplier: GenericRemoteSupplier = (
  { id, portal, payload },
  { type }
) => {
  const [, action] = type.split('.');
  const { recipient, ...p } = payload;

  return portal('queue', [
    'out',
    { sender: id, recipient, action, payload: p },
  ]);
};

const remote: RemoteSuppliers = {
  'remote.enter': remoteEnterSupplier,
  'remote.leave': remoteSupplier,
  'remote.resolve': remoteSupplier,
  'remote.get': remoteSupplier,
  'remote.set': remoteSupplier,
  'remote.call': remoteSupplier,
};

export default remote;

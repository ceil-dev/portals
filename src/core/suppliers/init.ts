import { CoreSuppliers, InitSupplier, PortalMethod } from '../types';

const init: InitSupplier = ({ id, env }, { demand, getSupplierTypes }) => {
  const hasDebug = getSupplierTypes().includes('debug');
  let depth = 1;

  const portal: PortalMethod = (
    hasDebug
      ? (action, payload) => {
          demand({
            key: 'debug',
            type: 'debug',
            data: [`[portal ${id}]`, '··'.repeat(depth), action, payload],
          });

          depth++;

          const result = demand({
            key: action,
            type: action as keyof CoreSuppliers,
            data: { id, env, portal, payload },
          });

          depth--;

          demand({
            key: 'debug',
            type: 'debug',
            data: [
              `[portal ${id}]`,
              '··'.repeat(depth),
              action,
              'resolved as',
              result,
            ],
          });

          // if (result instanceof Promise) {
          //   (async () => {
          //     const r = await result;
          //
          //     demand({
          //       key: 'debug',
          //       type: 'debug',
          //       data: [
          //         `[portal ${id}]`,
          //         '··'.repeat(debugLevel),
          //         action,
          //         'resolved as',
          //         r,
          //       ],
          //     });
          //   })().catch(console.warn);
          // }

          return result;
        }
      : (action, payload) =>
          demand({
            key: action,
            type: action as keyof CoreSuppliers,
            data: { id, env, portal, payload: payload } as any, // TODO: definitely do something about it
          })
  ) as PortalMethod;

  return portal;
};

export default init;

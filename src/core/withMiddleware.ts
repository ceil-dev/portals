import { Suppliers } from '@ceil-dev/supply-demand';
import { ExtendedSuppliers, Middleware } from './types';

const withMiddleware = <T extends Suppliers>(
  suppliers: T,
  middleware?: Middleware<any> | (Middleware<any> | undefined)[]
): ExtendedSuppliers<T> => {
  if (typeof middleware === 'function') {
    return { ...suppliers, ...middleware(suppliers) };
  }

  if (Array.isArray(middleware)) {
    return middleware.reduce((res, m) => {
      return withMiddleware(res, m);
    }, suppliers);
  }

  if (typeof middleware === 'object') {
    return { ...suppliers, ...middleware };
  }

  return suppliers;
};

export default withMiddleware;

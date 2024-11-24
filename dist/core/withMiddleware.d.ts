import { Suppliers } from '@ceil-dev/supply-demand';
import { ExtendedSuppliers, Middleware } from './types';
declare const withMiddleware: <T extends Suppliers>(suppliers: T, middleware?: Middleware<any> | (Middleware<any> | undefined)[]) => ExtendedSuppliers<T>;
export default withMiddleware;

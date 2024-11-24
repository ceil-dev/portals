import { PromisedValue } from './types';
export declare const promisedValue: (val: unknown) => PromisedValue;
export declare const asPromisedValue: (value: PromisedValue | any) => {
    value: any;
    resolve: any;
    reject: any;
};
export default promisedValue;

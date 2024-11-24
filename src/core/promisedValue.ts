import { PromisedValue } from './types';

export const promisedValue = (val: unknown): PromisedValue => {
  let promiseResolve: (value: unknown) => unknown;
  let promiseReject: (reason: unknown) => unknown;

  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;
  });

  return Object.assign(promise, {
    $promisedValueResolve: promiseResolve!,
    $promisedValueReject: promiseReject!,
    $promisedValue: val,
  });
};

export const asPromisedValue = (value: PromisedValue | any) => {
  let v = value;
  let resolve;
  let reject;
  if (
    typeof value?.then === 'function' &&
    '$promisedValue' in value &&
    '$promisedValueResolve' in value &&
    '$promisedValueReject' in value
  ) {
    v = value.$promisedValue;
    resolve = value.$promisedValueResolve;
    reject = value.$promisedValueReject;
  }

  return { value: v, resolve, reject };
};

export default promisedValue;

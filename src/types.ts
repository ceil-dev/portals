export type Portal = (action: string, payload: any) => any;

export type PromisedValue = Promise<any> & {
  $promisedValue: any;
  $promisedValueResolve: (value: any) => any;
  $promisedValueReject: (reason: any) => any;
};

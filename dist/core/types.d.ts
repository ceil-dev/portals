import { Supplier, Suppliers } from '@ceil-dev/supply-demand';
import { MicroEnv, MicroEnvDescriptor } from '@ceil-dev/microenv';
import { PersistenceApi } from '@ceil-dev/persistence';
type PortalSupplierData<TPayload = unknown> = {
    id: string;
    portal: PortalMethod;
    env: MicroEnv;
    payload: TPayload;
};
export type PortalSupplier<TPayload = unknown, TReturn = any> = Supplier<PortalSupplierData<TPayload>, TReturn, CoreSuppliers>;
type Guest = {
    id: string;
};
type LocalEnterPayload = {
    sender: string;
} & Guest;
export type EnterSupplierReturn = Promise<{
    id: string;
    envDescriptor: MicroEnvDescriptor;
}>;
interface ISerializableObject extends Record<string, Serializable | undefined> {
}
export type SerializableObject = ISerializableObject;
export type Serializable = null | string | number | boolean | SerializableObject | Serializable[];
type GetPayload = {
    key: string;
    sender: string;
    next?: boolean;
};
type SetPayload = {
    key: string;
    value?: Serializable;
    sender: string;
};
type CallPayload = {
    key: string;
    value: Serializable[];
    sender: string;
};
export type QueueEntry = {
    id: string;
    sender: string;
    index: number;
    recipient: string;
    action: 'enter' | 'leave' | 'get' | 'set' | 'call' | 'resolve';
    payload: SerializableObject;
    result?: {
        value: any;
    } | Promise<any>;
    synced?: boolean;
    removed?: boolean;
    keep?: boolean;
};
export type QueueOutEntry = {
    id: string;
    sender: string;
    index: number;
    recipient: string;
    action: 'enter' | 'leave' | 'get' | 'set' | 'call' | 'resolve';
    payload: SerializableObject;
};
type SendPayload = {
    recipient: string;
    payload: {
        sync: number;
        queue?: QueueOutEntry[];
    };
};
type EtherSendPayload = {
    recipient: string;
    payload?: unknown;
};
type RemotePayload = {
    recipient: string;
} & Record<string, Serializable>;
type RemoteGetPayload = {
    recipient: string;
    key: string;
    next?: boolean;
};
type RemoteSetPayload = {
    recipient: string;
    key: string;
    value: Serializable;
};
type RemoteResolvePayload = {
    recipient: string;
    key: string;
    err?: string;
    value?: Serializable;
};
type RemoteCallPayload = {
    recipient: string;
    key: string;
    value: Serializable;
};
type RemoteEnterPayload = {
    id: string;
};
type ReceiveReturn = {
    sender: string;
};
export type InitSupplier = Supplier<{
    id: string;
    env: MicroEnv;
}, PortalMethod, CoreSuppliers & {
    debug: DebugSupplier;
}>;
export type SendSupplier = PortalSupplier<SendPayload, Promise<unknown>>;
export type ReceiveSupplier = PortalSupplier<unknown, Promise<ReceiveReturn | undefined>>;
type QueueOperation = 'in' | 'out' | 'process' | 'dispatch' | 'reset';
export type QueueSupplier = PortalSupplier<[
    op: QueueOperation,
    payload?: any,
    settings?: any
], Promise<{
    result?: unknown;
} | undefined | void>>;
export type OpenSupplier = PortalSupplier<undefined>;
export type DebugSupplier = Supplier<any[]>;
export type CloseSupplier = PortalSupplier;
export type GuestSupplier = PortalSupplier<Guest>;
export type EnterSupplier = PortalSupplier<string, Promise<MicroEnv>>;
export type LeaveSupplier = PortalSupplier;
export type EtherAttachSupplier = PortalSupplier<undefined>;
export type EtherSendSupplier = PortalSupplier<EtherSendPayload>;
export type EtherDetachSupplier = PortalSupplier<undefined>;
export type EtherRestartSupplier = PortalSupplier<{
    recipient: string;
}>;
export type LocalEnterSupplier = PortalSupplier<LocalEnterPayload, EnterSupplierReturn>;
export type LocalRestartSupplier = PortalSupplier<{
    sender: string;
}>;
export type LocalLeaveSupplier = PortalSupplier;
export type LocalGetSupplier = PortalSupplier<GetPayload>;
export type LocalSetSupplier = PortalSupplier<SetPayload>;
export type LocalCallSupplier = PortalSupplier<CallPayload>;
export type RemoteLeaveSupplier = GenericRemoteSupplier;
export type RemoteEnterSupplier = PortalSupplier<RemoteEnterPayload, EnterSupplierReturn>;
export type GenericRemoteSupplier = PortalSupplier<RemotePayload>;
export type RemoteSetSupplier = PortalSupplier<RemoteSetPayload>;
export type RemoteGetSupplier = PortalSupplier<RemoteGetPayload>;
export type RemoteCallSupplier = PortalSupplier<RemoteCallPayload>;
export type RemoteResolveSupplier = PortalSupplier<RemoteResolvePayload>;
export type PackagerPackSupplier = PortalSupplier<Serializable, unknown | Promise<unknown>>;
export type UnpackSupplierReturn = {
    sender: string;
    payload: SendPayload['payload'];
    sync: number;
};
export type PackagerUnpackSupplier = PortalSupplier<unknown, UnpackSupplierReturn | Promise<UnpackSupplierReturn>>;
export type CryptoSupplier = PortalSupplier<void, {
    randomUUID: () => string;
}>;
export type PersistenceSupplier = PortalSupplier<void, PersistenceApi>;
export type PackagerSuppliers = {
    'packager.pack': PackagerPackSupplier;
    'packager.unpack': PackagerUnpackSupplier;
};
export type EtherSuppliers = {
    'ether.attach'?: EtherAttachSupplier;
    'ether.send'?: EtherSendSupplier;
    'ether.detach'?: EtherDetachSupplier;
    'ether.restart'?: EtherRestartSupplier;
};
export type LocalSuppliers = {
    'local.enter': LocalEnterSupplier;
    'local.leave': LocalLeaveSupplier;
    'local.get': PortalSupplier<GetPayload>;
    'local.set': LocalSetSupplier;
    'local.call': LocalCallSupplier;
    'local.restart': LocalRestartSupplier;
};
export type RemoteSuppliers = {
    'remote.enter': RemoteEnterSupplier;
    'remote.leave': RemoteLeaveSupplier;
    'remote.get': RemoteGetSupplier;
    'remote.set': RemoteSetSupplier;
    'remote.call': RemoteCallSupplier;
    'remote.resolve': RemoteResolveSupplier;
};
export type CoreSuppliers = {
    init: InitSupplier;
    send: SendSupplier;
    receive: ReceiveSupplier;
    queue: QueueSupplier;
    open: OpenSupplier;
    close: CloseSupplier;
    guest: GuestSupplier;
    enter: EnterSupplier;
    leave: LeaveSupplier;
    crypto: CryptoSupplier;
    persistence: PersistenceSupplier;
} & EtherSuppliers & PackagerSuppliers & LocalSuppliers & RemoteSuppliers;
export type ExtendedSuppliers<T extends Suppliers> = Partial<T> & Suppliers;
export type Middleware<T extends Suppliers = CoreSuppliers> = ExtendedSuppliers<T> | ((s: T) => ExtendedSuppliers<T>);
export type EtherMiddleware = Middleware<Required<Pick<CoreSuppliers, 'ether.attach' | 'ether.send' | 'ether.detach'>> & Pick<CoreSuppliers, 'receive'>>;
export type PortalMethod = <T extends keyof CoreSuppliers = keyof CoreSuppliers>(key: T, ...rest: T extends keyof CoreSuppliers ? CoreSuppliers[T] extends PortalSupplier<infer P1> ? P1 extends undefined ? [payload?: undefined] : [payload: P1] : [unknown] : [unknown]) => T extends keyof CoreSuppliers ? CoreSuppliers[T] extends PortalSupplier<any, infer P2> ? P2 : unknown : unknown;
export type PromisedValue<T = unknown> = Promise<T> & {
    $promisedValue: T;
    $promisedValueResolve: (value: T) => void;
    $promisedValueReject: (reason?: unknown) => void;
};
export {};

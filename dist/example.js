"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('running...');
    const localEhter = (0, _1.createLocalEther)();
    const guestEnvs = {};
    const serverPortal = (0, _1.createLocalPortal)((0, _1.microEnv)({ foo: 'bar' }, { id: 'server' }, {
        set: ({ key, value, obj }) => {
            Object.values(guestEnvs).forEach((env) => (env.face[key] = value));
            return (obj[key] = value);
        },
    }), localEhter, {
        guest: (_a) => __awaiter(void 0, [_a], void 0, function* ({ portal, payload }) {
            const env = yield portal('enter', payload.id);
            guestEnvs[payload.id] = env;
            const { face } = env;
            yield (face.bar = (0, _1.promisedValue)(payload.id));
            console.log(`server: ${payload.id}.foo =`, yield face.foo);
        }),
        debug: (data) => {
            console.log(...data);
        },
    });
    serverPortal('open');
    for (let i = 0; i < 3; i++) {
        const clientPortal = (0, _1.createLocalPortal)((0, _1.microEnv)({ foo: 'bar' }, { id: 'client' + i }, {
            set: ({ key, value, obj }) => {
                obj[key] = value;
                console.log(`clientPortal ${i} env property "${key}" was set to ${value}`);
            },
        }), localEhter, {});
        console.time();
        const serverEnv = yield clientPortal('enter', 'server');
        console.timeEnd();
        console.log('setting serverEnv property "foo" to:', i.toString());
        serverEnv.set('foo', i.toString());
    }
});
const runServerClientMock = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('running server mock...');
    const server = (0, _1.createServerPortal)((0, _1.microEnv)({ foo: 'bar' }, { id: 'server' }), {
        guest: (_a) => __awaiter(void 0, [_a], void 0, function* ({ portal, payload }) {
            console.log('server guest:', payload);
            const clientEnv = yield portal('enter', payload.id);
            console.log('clientEnv descriptor:', clientEnv.descriptor);
        }),
    });
    server('open');
    const client = (0, _1.createClientPortal)({
        env: (0, _1.microEnv)({ someProp: 'some value' }, { id: 'client' }),
        send: (data) => __awaiter(void 0, void 0, void 0, function* () {
            return server('receive', data);
        }),
        middleware: {},
    });
    const serverEnv = yield client('enter', 'server');
    console.log('serverEnv descriptor:', serverEnv.descriptor);
    console.log('serverEnv peroperty "foo":', yield serverEnv.face.foo);
    serverEnv.set('foo', 'not bar');
    console.log('... new value:', yield serverEnv.face.foo);
});
const runTempTest = () => __awaiter(void 0, void 0, void 0, function* () {
    const localEhter = (0, _1.createLocalEther)();
    const portalB = (0, _1.createLocalPortal)((0, _1.microEnv)({
        foo: 'not bar',
    }, { id: 'portalB' }), localEhter);
    portalB('open');
    const portalA = (0, _1.createLocalPortal)((0, _1.microEnv)({ foo: 'bar' }, { id: 'portalA' }), localEhter);
    const envB = yield portalA('enter', 'portalB');
    console.log('envB:', envB);
    console.log('Set envB property "foo" to:', yield (envB.face.foo = (0, _1.promisedValue)(69)));
});
runServerClientMock().catch(console.warn);
//# sourceMappingURL=example.js.map
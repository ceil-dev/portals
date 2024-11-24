import {
  MicroEnv,
  microEnv,
  createLocalEther,
  createLocalPortal,
  promisedValue,
  createServerPortal,
  createClientPortal,
} from '.';

// This example updates all known guest environment's foo property to the value set by new guests
const run = async () => {
  console.log('running...');

  const localEhter = createLocalEther();

  const guestEnvs: Record<string, MicroEnv> = {};

  const serverPortal = createLocalPortal(
    microEnv(
      { foo: 'bar' },
      { id: 'server' },
      {
        set: ({ key, value, obj }) => {
          Object.values(guestEnvs).forEach((env) => (env.face[key] = value));
          return (obj[key] = value);
        },
      }
    ),
    localEhter,
    {
      guest: async ({ portal, payload }) => {
        const env = await portal('enter', payload.id);
        guestEnvs[payload.id] = env;

        const { face } = env;

        await (face.bar = promisedValue(payload.id));
        console.log(`server: ${payload.id}.foo =`, await face.foo);
      },
      debug: (data) => {
        console.log(...data);
      },
    }
  );

  serverPortal('open');

  for (let i = 0; i < 3; i++) {
    const clientPortal = createLocalPortal(
      microEnv(
        { foo: 'bar' },
        { id: 'client' + i },
        {
          set: ({ key, value, obj }) => {
            obj[key] = value;
            console.log(
              `clientPortal ${i} env property "${key}" was set to ${value}`
            );
          },
        }
      ),
      localEhter,
      {
        // debug: (data) => {
        //   console.log(...data);
        // },
      }
    );
    console.time();
    const serverEnv = await clientPortal('enter', 'server');
    console.timeEnd();

    console.log('setting serverEnv property "foo" to:', i.toString());
    serverEnv.set('foo', i.toString());
  }
};

const runServerClientMock = async () => {
  console.log('running server mock...');

  const server = createServerPortal(
    microEnv({ foo: 'bar' }, { id: 'server' }),
    {
      guest: async ({ portal, payload }) => {
        console.log('server guest:', payload);

        const clientEnv = await portal('enter', payload.id);
        console.log('clientEnv descriptor:', clientEnv.descriptor);
      },
      // debug: (args) => {
      //   console.log(...args);
      // },
    }
  );

  server('open');

  const client = createClientPortal({
    env: microEnv({ someProp: 'some value' }, { id: 'client' }),
    send: async (data) => {
      return server('receive', data);
    },
    middleware: {
      //
      // debug: (args) => {
      //   console.log(...args);
      // },
    },
  });

  const serverEnv = await client('enter', 'server');
  console.log('serverEnv descriptor:', serverEnv.descriptor);
  console.log('serverEnv peroperty "foo":', await serverEnv.face.foo);
  serverEnv.set('foo', 'not bar');
  console.log('... new value:', await serverEnv.face.foo);
};

const runTempTest = async () => {
  const localEhter = createLocalEther();

  const portalB = createLocalPortal(
    microEnv(
      {
        foo: 'not bar',
      },
      { id: 'portalB' }
    ),
    localEhter
    // { debug: (args) => console.log(...args) }
  );

  portalB('open');

  const portalA = createLocalPortal(
    microEnv({ foo: 'bar' }, { id: 'portalA' }),
    localEhter
    // { debug: (args) => console.log(...args) }
  );

  const envB = await portalA('enter', 'portalB');
  console.log('envB:', envB);

  console.log(
    'Set envB property "foo" to:',
    await (envB.face.foo = promisedValue(69))
  );
};

// run().catch(console.warn);
// runTempTest().catch(console.warn);
runServerClientMock().catch(console.warn);

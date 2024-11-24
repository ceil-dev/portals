# Portals

**Short project description**  
_Cross-environment interoperation_

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Example](#example)
5. [License](#license)

---

## Overview

The Portals Library is engineered to enable seamless communication and interaction across various platforms and environments. It serves as a connective layer, allowing developers to integrate these platforms using a chosen transport technology (aka "Ether").

By importing the library, developers can instantly expose chosen data and methods, facilitating interaction between environments – whether directly or through the Portals App or a custom implementation of Portals UI.

---

## Installation

```bash
# Clone the repository
npm install @ceil-dev/portals
```

---

### Usage

```javascript
import { createPortal } from '@ceil-dev/portals';
```

---

### Example

```typescript
import {
  microEnv,
  createServerPortal,
  createClientPortal,
} from '@ceil-dev/portals';

const runServerClientMock = async () => {
  console.log('running server mock...');

  // Creating server portal instance
  const server = createServerPortal(
    microEnv({ foo: 'bar' }, { id: 'server' }),
    {
      guest: async ({ portal, payload }) => {
        console.log('server guest:', payload);

        // entering guest environment
        const clientEnv = await portal('enter', payload.id);
        console.log('clientEnv descriptor:', clientEnv.descriptor);
      },
    }
  );

  // Opening server portal
  server('open');

  // Creating client portal instance
  const client = createClientPortal({
    env: microEnv({ someProp: 'some value' }, { id: 'client' }),
    send: async (data) => {
      // imitating communication by streaming data straight into server portal
      return server('receive', data);
    },
  });

  // Entering server portal
  const serverEnv = await client('enter', 'server');
  console.log('serverEnv descriptor:', serverEnv.descriptor);

  console.log('serverEnv peroperty "foo":', await serverEnv.face.foo);
  
  serverEnv.set('foo', 'not bar');
  console.log('... new value:', await serverEnv.face.foo);
};

runServerClientMock().catch(console.warn);
```

---

### License

This project is licensed under the Portals License (Modified CC BY-ND) - see the [LICENSE](LICENSE) file for details.

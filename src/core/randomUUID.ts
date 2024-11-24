let _crypto;

try {
  _crypto = globalThis.crypto || require('crypto');
} catch (err) {
  console.error('crypto support is disabled!');
}

if (_crypto && !_crypto.randomUUID)
  _crypto.randomUUID = () =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (_crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );

// Important!: can be undefined if crypto isn't available on the platform
export const randomUUID = () => _crypto?.randomUUID?.();

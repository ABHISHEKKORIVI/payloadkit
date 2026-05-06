const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

export const createHashValue = async (value, algorithm = 'SHA-256') => {
  if (!value) {
    throw new Error('Enter text before generating a hash.');
  }

  const cryptoApi = window.crypto?.subtle;

  if (!cryptoApi) {
    throw new Error('Web Crypto is not available in this browser.');
  }

  const encodedValue = new TextEncoder().encode(value);
  const hashBuffer = await cryptoApi.digest(algorithm, encodedValue);

  return toHex(hashBuffer);
};

const createUuidValue = () => {
  const cryptoApi = window.crypto;

  if (!cryptoApi?.randomUUID) {
    throw new Error('UUID generation is not available in this browser.');
  }

  return cryptoApi.randomUUID();
};

export const createUuidBatch = (count) => {
  if (!Number.isInteger(count) || count < 1 || count > 50) {
    throw new Error('Choose a UUID count between 1 and 50.');
  }

  return Array.from({ length: count }, () => createUuidValue()).join('\n');
};

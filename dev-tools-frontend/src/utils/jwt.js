const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);

  if (typeof TextDecoder !== 'undefined') {
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  return decodeURIComponent(
    binary
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
  );
};

export const parseJwtValue = (value) => {
  const segments = value.trim().split('.');

  if (segments.length < 2) {
    throw new Error('JWT must include at least a header and payload.');
  }

  const [headerSegment, payloadSegment] = segments;
  const headerObject = JSON.parse(decodeBase64Url(headerSegment));
  const payloadObject = JSON.parse(decodeBase64Url(payloadSegment));

  let status = 'No expiry';

  if (typeof payloadObject.exp === 'number') {
    status = payloadObject.exp * 1000 < Date.now() ? 'Expired' : 'Valid';
  }

  return {
    header: JSON.stringify(headerObject, null, 2),
    payload: JSON.stringify(payloadObject, null, 2),
    status,
  };
};

const SECONDS_LENGTH = 10;

const parseTimestampInput = (value) => {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error('Enter a Unix timestamp before converting it.');
  }

  if (!/^-?\d+$/.test(trimmed)) {
    throw new Error('Timestamp must contain digits only.');
  }

  const numericValue = Number(trimmed);

  if (!Number.isSafeInteger(numericValue)) {
    throw new Error('Timestamp is outside the supported safe integer range.');
  }

  return trimmed.length <= SECONDS_LENGTH ? numericValue * 1000 : numericValue;
};

export const convertTimestamp = (value) => {
  const milliseconds = parseTimestampInput(value);
  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Timestamp could not be converted into a valid date.');
  }

  return {
    iso: date.toISOString(),
    local: date.toLocaleString(),
    utc: date.toUTCString(),
    milliseconds: String(milliseconds),
    seconds: String(Math.floor(milliseconds / 1000)),
  };
};

export const createCurrentTimestamp = () => {
  const milliseconds = Date.now();

  return {
    input: String(Math.floor(milliseconds / 1000)),
    result: convertTimestamp(String(milliseconds)),
  };
};

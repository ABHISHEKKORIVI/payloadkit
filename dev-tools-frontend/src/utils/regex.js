export const parseRegexFlags = (value) => {
  if (!/^[dgimsuvy]*$/.test(value)) {
    throw new Error('Regex flags can only include d, g, i, m, s, u, v, or y.');
  }

  const uniqueFlags = new Set(value.split(''));

  if (uniqueFlags.size !== value.length) {
    throw new Error('Regex flags must not repeat.');
  }

  return value;
};

export const runRegexMatch = (pattern, flags, sample) => {
  if (!pattern) {
    throw new Error('Enter a regex pattern first.');
  }

  const safeFlags = parseRegexFlags(flags);
  const expression = new RegExp(pattern, safeFlags);
  const matches = [...sample.matchAll(expression)];

  if (matches.length) {
    return matches.map((match) => match[0]);
  }

  if (!safeFlags.includes('g')) {
    const singleMatch = sample.match(expression);
    return singleMatch ? [singleMatch[0]] : [];
  }

  return [];
};

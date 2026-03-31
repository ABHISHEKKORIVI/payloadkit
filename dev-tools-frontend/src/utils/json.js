export const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const highlightJson = (value) => {
  const escaped = escapeHtml(value);

  return escaped.replace(
    /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"\s*:?)|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (match) => {
      let tokenClass = 'json-number';

      if (match.startsWith('"')) {
        tokenClass = match.endsWith(':') ? 'json-key' : 'json-string';
      } else if (/true|false/.test(match)) {
        tokenClass = 'json-boolean';
      } else if (match === 'null') {
        tokenClass = 'json-null';
      }

      return `<span class="${tokenClass}">${match}</span>`;
    }
  );
};

export const formatJsonValue = (value) => JSON.stringify(JSON.parse(value), null, 2);

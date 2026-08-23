const defaultApiBaseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || defaultApiBaseUrl;

export const postJson = async (path, payload) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.detail || 'Backend request failed.');
  }

  return data;
};

export const encodeUrlValue = (value) => encodeURIComponent(value);

export const decodeUrlValue = (value) => {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    throw new Error('Invalid encoded URL input.');
  }
};

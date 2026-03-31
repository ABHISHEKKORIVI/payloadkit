import * as QRCode from 'qrcode';

export const createQrCode = (value, options) => {
  const qrGenerator = QRCode.toDataURL || QRCode.default?.toDataURL;

  if (!qrGenerator) {
    return Promise.reject(new Error('QR generator is unavailable.'));
  }

  return qrGenerator(value, options);
};

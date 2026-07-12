const qrcode = require('qrcode');

const generateQRCode = async (data) => {
  const qrDataUrl = await qrcode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    color: { dark: '#1f2328', light: '#ffffff' },
  });
  return qrDataUrl;
};

module.exports = { generateQRCode };

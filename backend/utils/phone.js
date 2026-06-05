export const PHONE_FORMAT_MESSAGE = 'Format telephone attendu: +212612345678 ou +33123456789';

export const normalizeInternationalPhone = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const compact = raw.replace(/[\s().-]/g, '');
  const normalized = compact.startsWith('00') ? `+${compact.slice(2)}` : compact;

  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    const error = new Error(PHONE_FORMAT_MESSAGE);
    error.statusCode = 400;
    throw error;
  }

  return normalized;
};

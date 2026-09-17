export const normalizePhoneNumber = (value) => {
  if (value === null || value === undefined) return '';

  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length > 10) {
    return digits.replace(/^91/, '').slice(-10);
  }

  return digits.slice(-10);
};

export function displayLocalNumber(raw) {
  if (!raw && raw !== 0) return raw;
  const s = String(raw).trim();
  // Remove non-digit characters, but keep a leading + temporarily to detect explicit +254
  const digits = s.replace(/[^\d+]/g, '');
  // Normalize: drop leading + if present
  const norm = digits.startsWith('+') ? digits.slice(1) : digits;

  if (norm.startsWith('254')) {
    // +254XXXXXXXXX -> 0XXXXXXXXX (drop country code, prefix 0)
    return '0' + norm.slice(3);
  }

  if (norm.startsWith('0')) {
    // Already local format
    return norm;
  }

  // If it's 9 digits starting with 7 or 1 (local without leading 0), add 0
  if (/^[17]\d{8}$/.test(norm)) {
    return '0' + norm;
  }

  // Fallback: return original string
  return s;
}

export function toE164(raw) {
  if (!raw && raw !== 0) return raw;
  const s = String(raw).trim();
  // Remove all non-digit characters
  const digits = s.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length >= 12) {
    return '+' + digits.slice(0, 12); // ensure +254XXXXXXXXX
  }
  if (digits.length === 9 && /^[17]\d{8}$/.test(digits)) {
    // local without leading 0 e.g. 712345678 -> +254712345678
    return '+254' + digits;
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return '+254' + digits.slice(1);
  }
  if (s.startsWith('+')) {
    // assume it's already in E.164
    return s;
  }
  // Fallback: return original input
  return s;
}

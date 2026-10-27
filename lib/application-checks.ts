// The rules for the application form. The server applies them to every submission; the form in the browser
// uses the same rules to take an error message away as soon as the visitor has fixed that field.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s\-()]+$/;

export const applicationChecks = {
  name: (value: string) => value.trim().length >= 2,
  phone: (value: string) => {
    const digits = value.replace(/\D/g, "");
    return PHONE_RE.test(value.trim()) && digits.length >= 9 && digits.length <= 15;
  },
  email: (value: string) => EMAIL_RE.test(value.trim()),
  city: (value: string) => value.trim().length >= 2,
};

export type CheckedField = keyof typeof applicationChecks;

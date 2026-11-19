// Each function returns the message to show, or `null` when the value is fine.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The same limits as the API (bcrypt ignores everything after 72 characters).
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;

export function validateName(value: string): string | null {
  return value.trim() ? null : 'Ingresa tu nombre.';
}

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Ingresa tu correo.';
  return EMAIL_PATTERN.test(email) ? null : 'Ingresa un correo válido.';
}

/** When logging in, the password is only compared: it just has to be there. */
export function validateLoginPassword(value: string): string | null {
  return value ? null : 'Ingresa tu contraseña.';
}

export function validateNewPassword(value: string): string | null {
  if (!value) return 'Crea una contraseña.';
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (value.length > MAX_PASSWORD_LENGTH) {
    return `La contraseña no puede tener más de ${MAX_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

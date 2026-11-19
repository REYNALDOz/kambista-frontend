// What the user reads when something fails. The API names its domain errors
// (for example `InvalidCredentialsError`), and each one is translated here.
const BY_ERROR_NAME: Record<string, string> = {
  InvalidCredentialsError: 'Correo o contraseña incorrectos.',
  EmailAlreadyRegisteredError: 'Ese correo ya está registrado. Inicia sesión.',
  InvalidEmailError: 'Ingresa un correo válido.',
  InvalidNameError: 'Ingresa tu nombre.',
  SameCurrencyError: 'La moneda de origen y la de destino deben ser distintas.',
  InvalidAmountError: 'El monto debe ser mayor a cero.',
  InvalidDateRangeError:
    'Revisa las fechas: la fecha inicial no puede ser posterior a la final.',
  ExchangeRateNotAvailableError:
    'Todavía no hay un tipo de cambio disponible. Inténtalo en unos segundos.',
};

export const NETWORK_ERROR =
  'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';

export function messageFor(status: number, errorName?: string): string {
  if (errorName && BY_ERROR_NAME[errorName]) {
    return BY_ERROR_NAME[errorName];
  }
  if (status === 400) return 'Revisa los datos ingresados.';
  if (status === 401) return 'Tu sesión expiró. Inicia sesión de nuevo.';
  if (status >= 500) {
    return 'Algo salió mal en el servidor. Inténtalo de nuevo en unos minutos.';
  }
  return 'No pudimos completar la operación. Inténtalo de nuevo.';
}

/** The message to show for anything a `try/catch` caught. */
export function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

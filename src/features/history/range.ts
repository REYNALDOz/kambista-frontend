const DAYS_IN_DEFAULT_RANGE = 30;

// A `type` (not an `interface`) so it can be sent as the query of a request.
export type DayRange = {
  startDate: string;
  endDate: string;
};

/** A `Date` as `YYYY-MM-DD`, in the user's own time zone (what a date input shows). */
function toLocalDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The last 30 days, today included. */
export function defaultRange(now: Date = new Date()): DayRange {
  const start = new Date(now);
  start.setDate(start.getDate() - (DAYS_IN_DEFAULT_RANGE - 1));
  return { startDate: toLocalDay(start), endDate: toLocalDay(now) };
}

/**
 * Turns the days chosen by the user into the exact instants where those days start and end
 * in their time zone. Sending just "2024-01-18" would mean the day in UTC, and an exchange made
 * at 8 pm in Peru is already the next day in UTC, so it would fall outside the range.
 */
export function toInstants({ startDate, endDate }: DayRange): DayRange {
  return {
    startDate: new Date(`${startDate}T00:00:00`).toISOString(),
    endDate: new Date(`${endDate}T23:59:59.999`).toISOString(),
  };
}

/** The message to show under each date, or `null` when it is fine. */
export function validateRange({ startDate, endDate }: DayRange): {
  startDate: string | null;
  endDate: string | null;
} {
  return {
    startDate: startDate ? null : 'Selecciona la fecha inicial.',
    endDate: !endDate
      ? 'Selecciona la fecha final.'
      : startDate && endDate < startDate
        ? 'La fecha final no puede ser anterior a la inicial.'
        : null,
  };
}

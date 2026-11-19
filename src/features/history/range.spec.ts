import { describe, expect, it } from 'vitest';
import { defaultRange, toInstants, validateRange } from './range';

// The tests run in the time zone of Peru (UTC-5), set in `vite.config.ts`.
describe('toInstants', () => {
  it('turns the days of the user into the instants where those days start and end', () => {
    expect(
      toInstants({ startDate: '2024-01-18', endDate: '2024-01-18' }),
    ).toEqual({
      startDate: '2024-01-18T05:00:00.000Z',
      endDate: '2024-01-19T04:59:59.999Z',
    });
  });

  it('keeps an exchange made at 8 pm in Peru inside the day it was made', () => {
    const range = toInstants({
      startDate: '2024-01-18',
      endDate: '2024-01-18',
    });
    const exchange = '2024-01-19T01:00:00.000Z'; // 8 pm of January 18 in Peru

    expect(exchange >= range.startDate && exchange <= range.endDate).toBe(true);
  });
});

describe('defaultRange', () => {
  it('is the last 30 days, today included', () => {
    const now = new Date('2024-01-31T20:00:00-05:00');

    expect(defaultRange(now)).toEqual({
      startDate: '2024-01-02',
      endDate: '2024-01-31',
    });
  });
});

describe('validateRange', () => {
  it('accepts a range, also a single day', () => {
    expect(
      validateRange({ startDate: '2024-01-01', endDate: '2024-01-31' }),
    ).toEqual({
      startDate: null,
      endDate: null,
    });
    expect(
      validateRange({ startDate: '2024-01-05', endDate: '2024-01-05' }).endDate,
    ).toBeNull();
  });

  it('asks for both dates', () => {
    expect(validateRange({ startDate: '', endDate: '' })).toEqual({
      startDate: 'Selecciona la fecha inicial.',
      endDate: 'Selecciona la fecha final.',
    });
  });

  it('rejects an end date before the start date', () => {
    expect(
      validateRange({ startDate: '2024-02-01', endDate: '2024-01-01' }).endDate,
    ).toBe('La fecha final no puede ser anterior a la inicial.');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestWithHeaders } from '../../shared/api/http';
import { getHistory } from './api';

vi.mock('../../shared/api/http');

const range = {
  startDate: '2024-01-01T05:00:00.000Z',
  endDate: '2024-01-31T04:59:59.999Z',
};

const reply = (items: unknown[], headers: Record<string, string> = {}) =>
  ({ data: items, headers: new Headers(headers) }) as never;

describe('getHistory', () => {
  beforeEach(() => {
    vi.mocked(requestWithHeaders).mockReset();
  });

  it('asks the server for the page and the size', async () => {
    vi.mocked(requestWithHeaders).mockResolvedValue(reply([]));

    await getHistory(range, 3, 10);

    expect(requestWithHeaders).toHaveBeenCalledWith(
      '/v1/transactions/history',
      { query: { ...range, page: '3', limit: '10' } },
    );
  });

  it('reads the total of the whole range from the X-Total-Count header', async () => {
    vi.mocked(requestWithHeaders).mockResolvedValue(
      reply([{ id: 'a' }, { id: 'b' }], { 'X-Total-Count': '25' }),
    );

    const page = await getHistory(range, 1, 10);

    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(25);
  });

  it('trusts a total of 0 reported by the server', async () => {
    vi.mocked(requestWithHeaders).mockResolvedValue(
      reply([], { 'X-Total-Count': '0' }),
    );

    expect((await getHistory(range, 1, 10)).total).toBe(0);
  });

  it('uses the number of items when the header is missing, not 0', async () => {
    vi.mocked(requestWithHeaders).mockResolvedValue(
      reply([{ id: 'a' }, { id: 'b' }, { id: 'c' }]),
    );

    expect((await getHistory(range, 1, 10)).total).toBe(3);
  });

  it.each(['abc', '-1', '1.5', ''])(
    'ignores the invalid total "%s" and uses the number of items',
    async (header) => {
      vi.mocked(requestWithHeaders).mockResolvedValue(
        reply([{ id: 'a' }], { 'X-Total-Count': header }),
      );

      expect((await getHistory(range, 1, 10)).total).toBe(1);
    },
  );
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, configureHttp, request, requestWithHeaders } from './http';

const answer = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { status: 200, ...init });

function stubFetch(response: Response | Error) {
  const fetchMock = vi.fn(() =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('http client', () => {
  const onUnauthorized = vi.fn();

  beforeEach(() => {
    onUnauthorized.mockReset();
    configureHttp({ getToken: () => null, onUnauthorized });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('request returns only the body of the response', async () => {
    stubFetch(answer({ id: 1 }, { headers: { 'X-Total-Count': '7' } }));

    expect(await request('/v1/anything')).toEqual({ id: 1 });
  });

  it('requestWithHeaders returns the body together with the headers', async () => {
    stubFetch(answer([{ id: 1 }], { headers: { 'X-Total-Count': '7' } }));

    const result = await requestWithHeaders<{ id: number }[]>('/v1/anything');

    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.headers.get('X-Total-Count')).toBe('7');
  });

  it('puts the query in the address and leaves out the empty values', async () => {
    const fetchMock = stubFetch(answer([]));

    await request('/v1/transactions/history', {
      query: { page: '2', limit: '10', userId: undefined },
    });

    const url = String((fetchMock.mock.calls[0] as unknown[])[0]);
    expect(url).toContain('/v1/transactions/history?page=2&limit=10');
    expect(url).not.toContain('userId');
  });

  it('sends the token of the session', async () => {
    configureHttp({ getToken: () => 'abc', onUnauthorized });
    const fetchMock = stubFetch(answer([]));

    await requestWithHeaders('/v1/anything');

    const init = (fetchMock.mock.calls[0] as unknown[])[1] as {
      headers: Record<string, string>;
    };
    expect(init.headers.Authorization).toBe('Bearer abc');
  });

  it('says the session expired when a request with a token gets a 401', async () => {
    configureHttp({ getToken: () => 'abc', onUnauthorized });
    stubFetch(answer({ error: 'Unauthorized' }, { status: 401 }));

    await expect(requestWithHeaders('/v1/anything')).rejects.toBeInstanceOf(
      ApiError,
    );

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not close the session on a 401 without a token, such as a wrong password', async () => {
    stubFetch(answer({ error: 'InvalidCredentialsError' }, { status: 401 }));

    await expect(request('/v1/auth/login')).rejects.toMatchObject({
      status: 401,
    });

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('fails with status 0 when the server cannot be reached', async () => {
    stubFetch(new TypeError('Failed to fetch'));

    await expect(requestWithHeaders('/v1/anything')).rejects.toMatchObject({
      status: 0,
    });
  });
});

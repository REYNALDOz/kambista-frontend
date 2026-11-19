import { API_URL } from '../config';
import { messageFor, NETWORK_ERROR } from './error-messages';

export interface HttpResult<T> {
  data: T;
  headers: Headers;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface HttpHandlers {
  getToken(): string | null;
  onUnauthorized(): void;
}

let handlers: HttpHandlers = {
  getToken: () => null,
  onUnauthorized: () => {},
};

export function configureHttp(next: HttpHandlers): void {
  handlers = next;
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  query?: Record<string, string | undefined>;
}

export async function requestWithHeaders<T>(
  path: string,
  { method = 'GET', body, query = {} }: RequestOptions = {},
): Promise<HttpResult<T>> {
  const url = new URL(path, API_URL);
  for (const [name, value] of Object.entries(query)) {
    if (value) url.searchParams.set(name, value);
  }

  const token = handlers.getToken();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR);
  }

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    // A 401 while holding a token means the session expired. (A failed login
    // is also a 401, but it has no token yet.)
    if (response.status === 401 && token) handlers.onUnauthorized();
    throw new ApiError(
      response.status,
      messageFor(response.status, problem?.error),
    );
  }

  return { data: (await response.json()) as T, headers: response.headers };
}
export async function request<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  return (await requestWithHeaders<T>(path, options)).data;
}

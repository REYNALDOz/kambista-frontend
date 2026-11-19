import { request } from '../../shared/api/http';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'user' | 'admin';
}

export interface LoginResult {
  access_token: string;
  usuario: User;
}

export function login(email: string, password: string): Promise<LoginResult> {
  return request<LoginResult>('/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(
  nombre: string,
  email: string,
  password: string,
): Promise<User> {
  return request<User>('/v1/auth/register', {
    method: 'POST',
    body: { nombre, email, password },
  });
}

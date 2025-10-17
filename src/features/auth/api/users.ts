// Deprecated file: keep thin wrappers to new /auth API for backward imports
import apiClient from 'shared/api/client';
import type { LoginRequest, LoginResponse, CheckIdRequest, SignupRequest } from 'shared/types/users';

export async function login(data: LoginRequest) {
  const res = await apiClient.post<LoginResponse>('/auth/login', data as any);
  return res.data as any;
}

export async function checkId(data: CheckIdRequest) {
  const res = await apiClient.post('/auth/check-id', data);
  return res.status === 200;
}

export async function signup(data: SignupRequest) {
  const res = await apiClient.post('/auth/signup', data as any);
  return res.status === 201;
}

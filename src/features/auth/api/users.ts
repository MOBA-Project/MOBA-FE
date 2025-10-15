import apiClient from 'shared/api/client';
import type { LoginRequest, LoginResponse, CheckIdRequest, SignupRequest } from 'shared/types/users';

export async function login(data: LoginRequest) {
  const res = await apiClient.post<LoginResponse>('/users/login', data);
  return res.data;
}

export async function checkId(data: CheckIdRequest) {
  const res = await apiClient.post('/users/check-id', data);
  return res.status === 200;
}

export async function signup(data: SignupRequest) {
  const res = await apiClient.post('/users/signup', data);
  return res.status === 201;
}


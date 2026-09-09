import { apiClient } from '@/api/client';

export type SignupPayload = {
  username: string;
  nickname: string;
  password: string;
  passwordConfirm: string;
  name: string;
};

export type SignupResponse = {
  id: number;
  username: string;
  nickname: string;
};

export async function signup(payload: SignupPayload) {
  const { data } = await apiClient.post<SignupResponse>('/user/signup', payload);
  return data;
}

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: number; nickname: string };
};

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<LoginResponse>('/user/login', payload);
  return data;
}

export async function checkUsernameAvailable(username: string) {
  const { data } = await apiClient.get<{ available: boolean }>('/user/check-username', {
    params: { username },
  });
  return data.available;
}

import axios, { type InternalAxiosRequestConfig } from 'axios';

import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '@/api/session';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) return null;

  try {
    const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${process.env.EXPO_PUBLIC_API_URL}/user/refresh`,
      { refreshToken: currentRefreshToken },
    );
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data.accessToken;
  } catch {
    setAccessToken(null);
    setRefreshToken(null);
    return null;
  }
}

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// accessToken 만료(401)로 요청이 실패하면 refreshToken으로 한 번만 재발급받아 원래 요청을 재시도.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retried ||
      config.url?.includes('/user/refresh') ||
      config.url?.includes('/user/login')
    ) {
      return Promise.reject(error);
    }

    config._retried = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const newAccessToken = await refreshPromise;
    if (!newAccessToken) {
      return Promise.reject(error);
    }

    config.headers.Authorization = `Bearer ${newAccessToken}`;
    return apiClient(config);
  },
);

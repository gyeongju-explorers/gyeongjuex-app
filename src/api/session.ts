import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function getAccessToken() {
  return accessToken;
}

export function setRefreshToken(token: string | null) {
  refreshToken = token;
  if (token) {
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getRefreshToken() {
  return refreshToken;
}

// 앱 시작 시 저장해둔 토큰들을 메모리로 복원 — accessToken이 만료돼도
// refreshToken으로 재발급받을 수 있어 재로그인 없이 로그인 상태가 유지된다.
export async function hydrateSession() {
  const [storedAccessToken, storedRefreshToken] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  ]);
  accessToken = storedAccessToken;
  refreshToken = storedRefreshToken;
  return accessToken;
}

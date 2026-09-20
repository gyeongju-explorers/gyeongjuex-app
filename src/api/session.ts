import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken';
const NICKNAME_KEY = 'nickname';

let accessToken: string | null = null;
let nickname: string | null = null;

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

export function setNickname(value: string | null) {
  nickname = value;
  if (value) {
    AsyncStorage.setItem(NICKNAME_KEY, value);
  } else {
    AsyncStorage.removeItem(NICKNAME_KEY);
  }
}

export function getNickname() {
  return nickname;
}

export async function hydrateAccessToken() {
  const [storedToken, storedNickname] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(NICKNAME_KEY),
  ]);
  accessToken = storedToken;
  nickname = storedNickname;
  return accessToken;
}

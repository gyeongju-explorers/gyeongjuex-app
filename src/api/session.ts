import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken';

let accessToken: string | null = null;

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

export async function hydrateAccessToken() {
  accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  return accessToken;
}

// TODO: 지금은 메모리에만 저장돼서 앱을 재시작하면 로그인 상태가 풀림.
// 나중에 AsyncStorage 등으로 영구 저장하도록 교체.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

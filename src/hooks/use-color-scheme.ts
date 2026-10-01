// 다크모드 미지원 — 시스템이 다크모드여도 항상 라이트 테마로 보여준다.
export function useColorScheme() {
  return 'light' as const;
}

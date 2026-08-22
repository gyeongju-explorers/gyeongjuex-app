# 개발 가이드 (Development Guide)

처음 이 프로젝트에서 개발을 시작하는 사람을 위한 가이드입니다. "어디에 뭘 작성해야 하는지"에 집중합니다.

- 브랜치 전략, 커밋 컨벤션, 네이밍 규칙 → [CONTRIBUTING.md](CONTRIBUTING.md)
- 사용 중인 프레임워크/라이브러리 목록 → [TECH_STACK.md](TECH_STACK.md)

## 1. 폴더 구조

```
src/
  app/            # expo-router 라우팅 전용 (파일 경로 = URL 경로)
  pages/          # 실제 화면 구현 (페이지별 컴포넌트를 조립)
  components/
    global/       # 여러 화면에서 재사용하는 공통 컴포넌트
    Home/         # Home 화면에서만 쓰는 컴포넌트
  api/            # 백엔드 통신 (axios). fetch/axios는 여기서만 호출
  types/          # 도메인별 타입 정의
  hooks/          # 커스텀 훅
  constants/      # 색상, 여백, 폰트 등 테마 상수
```

핵심 원칙 하나만 기억하면 됩니다: **`src/app/`은 라우팅 등록만 하고, 실제 코드는 그 바깥에 둔다.** 화면 UI는 `pages/`, 데이터는 `api/`, 재사용 조각은 `components/`.

## 2. 새 화면(페이지) 만들기

예시로 "Mission" 화면을 추가한다고 가정합니다.

**1) 실제 화면을 `src/pages/Mission/index.tsx`에 작성**

```tsx
// src/pages/Mission/index.tsx
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import { Spacing } from '@/constants/theme';

export default function Mission() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">미션</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four },
});
```

**2) 라우트 파일 `src/app/mission.tsx`은 재export만 함**

```tsx
// src/app/mission.tsx
export { default } from '@/pages/Mission';
```

파일명이 곧 경로입니다(`src/app/mission.tsx` → `/mission`). `src/app/` 안에는 이 한 줄짜리 파일과 `_layout.tsx`(레이아웃/탭 설정) 말고는 아무것도 두지 않습니다.

**3) 하단 탭에 노출하고 싶다면** `src/components/global/app-tabs.tsx`(네이티브)와 `app-tabs.web.tsx`(웹) 두 곳에 트리거를 추가합니다. 아이콘은 `assets/images/tabIcons/`에 `mission.png` / `mission@2x.png` / `mission@3x.png` 형태로 추가하세요(기존 `home.png` 참고).

## 3. 컴포넌트 만들기

기준은 간단합니다: **몇 개 화면에서 쓰이는가?**

| 위치 | 언제 |
|---|---|
| `src/components/global/` | Home, Mission, MyPage 등 두 화면 이상에서 재사용 |
| `src/components/{PageName}/` | 그 화면 안에서만 쓰이는 컴포넌트 |

컴포넌트 파일명은 `PascalCase.tsx`로 작성합니다(CONTRIBUTING.md 네이밍 규칙). 예: `src/components/Mission/MissionCard.tsx`.

페이지 파일에서는 이렇게 조립합니다:

```tsx
// src/pages/Mission/index.tsx
import { MissionCard } from '@/components/Mission/MissionCard';
import { ThemedView } from '@/components/global/themed-view';

export default function Mission() {
  return (
    <ThemedView>
      <MissionCard title="첨성대 방문하기" />
    </ThemedView>
  );
}
```

컴포넌트를 처음에는 페이지 폴더(`components/Mission/`)에 만들고, 나중에 다른 화면에서도 필요해지면 그때 `components/global/`로 옮기세요. 처음부터 global에 넣지 않아도 됩니다.

## 4. 스타일링

- 스타일은 항상 `StyleSheet.create({...})`로 선언하고, JSX에 인라인 객체 스타일을 직접 쓰지 않습니다.
- 색상을 하드코딩하지 말고 `ThemedText` / `ThemedView`를 사용하세요. 라이트/다크 모드가 자동으로 처리됩니다.

```tsx
<ThemedView type="backgroundElement" style={styles.card}>
  <ThemedText type="subtitle">제목</ThemedText>
  <ThemedText type="small" themeColor="textSecondary">설명 텍스트</ThemedText>
</ThemedView>
```

- `ThemedText`의 `type`: `default` `title` `subtitle` `small` `smallBold` `link` `linkPrimary` `code`
- `ThemedText`/`ThemedView`의 `themeColor`/`type`으로 쓸 수 있는 색상 키는 `src/constants/theme.ts`의 `Colors.light`에 정의되어 있습니다(`text`, `background`, `backgroundElement`, `backgroundSelected`, `textSecondary`). 새 색상이 필요하면 `Colors.light`와 `Colors.dark`에 같은 키로 각각 추가하세요.
- 여백은 매직 넘버 대신 `Spacing`(`constants/theme.ts`)을 사용합니다: `Spacing.one`~`Spacing.six`.

## 5. API 연동 (axios)

**규칙: axios 호출은 `src/api/` 안에서만 합니다. 화면(`pages/`)이나 컴포넌트 파일에서 axios를 직접 import하지 않습니다.**

### 5-1. 공통 axios 인스턴스

`src/api/client.ts`에 이미 만들어져 있습니다.

```ts
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

`.env.example`을 복사해 `.env`를 만들고 서버 주소를 채워주세요.

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_API_URL=http://localhost:8080
```

`.env`는 git에 커밋되지 않습니다(각자 로컬 값). 값을 바꾼 뒤에는 `expo start`를 재시작해야 반영됩니다. Expo에서 `EXPO_PUBLIC_` 접두사가 붙은 환경 변수만 앱 코드에서 읽을 수 있습니다.

### 5-2. 도메인별 API 파일

화면/기능 단위로 `src/api/{domain}.ts` 파일을 만들고, 그 안에서 `apiClient`로 요청 함수를 작성합니다.

```ts
// src/api/mission.ts
import { apiClient } from '@/api/client';
import type { Mission } from '@/types/mission';

export async function fetchMissions() {
  const { data } = await apiClient.get<Mission[]>('/missions');
  return data;
}
```

### 5-3. 화면에서 사용하기

화면/컴포넌트는 `api/` 함수만 호출하고, 로딩/에러 상태를 관리합니다.

```tsx
// src/pages/Mission/index.tsx
import { useEffect, useState } from 'react';

import { fetchMissions } from '@/api/mission';
import type { Mission } from '@/types/mission';

export default function Mission() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMissions()
      .then(setMissions)
      .finally(() => setIsLoading(false));
  }, []);

  // ...isLoading, missions로 렌더링
}
```

로그인 기능이 붙으면 `api/client.ts`에 요청 인터셉터를 추가해 `Authorization` 헤더를 자동으로 붙이면 됩니다(지금은 로그인이 없으니 미리 만들지 않았습니다).

## 6. 타입 (`src/types/`)

- 도메인 단위로 파일을 나눕니다: `types/mission.ts`, `types/user.ts` 등.
- API 요청/응답 타입은 대응하는 `api/{domain}.ts`와 같은 도메인 이름을 씁니다.
- 여러 도메인이 공유하는 타입만 `types/common.ts` 같은 공용 파일에 둡니다.

```ts
// src/types/mission.ts
export type Mission = {
  id: number;
  title: string;
  isCompleted: boolean;
};
```

## 7. 요약: 뭘 만들 때 어디에 두나

| 하고 싶은 것 | 위치 |
|---|---|
| 새 화면 추가 | `pages/{Page}/index.tsx` + `app/{route}.tsx` (재export) |
| 여러 화면에서 쓰는 컴포넌트 | `components/global/` |
| 한 화면에서만 쓰는 컴포넌트 | `components/{Page}/` |
| 색상 · 여백 · 폰트 | `constants/theme.ts` |
| 백엔드 API 호출 | `api/{domain}.ts` (`api/client.ts`의 axios 사용) |
| 요청/응답 타입 | `types/{domain}.ts` |
| 여러 곳에서 쓰는 로직(상태/이펙트) | `hooks/use-{name}.ts` |

## 8. 커밋 전 확인

```bash
npm run lint
npx tsc --noEmit
npm run format
```

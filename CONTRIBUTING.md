# 개발 규칙 (Contributing Guide)

경주 익스플로러 앱 개발에 참여하는 모든 팀원이 따르는 공통 규칙입니다.

## 브랜치 전략

- `main`: 항상 실행 가능한 상태를 유지합니다. 직접 push 금지, PR로만 merge.
- `feature/{이슈번호}-{설명}`: 기능 개발. 예) `feature/12-map-screen`
- `fix/{이슈번호}-{설명}`: 버그 수정. 예) `fix/23-login-crash`

작업을 시작하기 전에 관련 이슈를 먼저 만들고, 이슈 번호를 브랜치명에 포함해주세요.

```bash
git checkout main
git pull origin main
git checkout -b feature/12-map-screen
```

## 커밋 메시지 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다.

```
<type>: <설명>
```

| type       | 의미                              |
| ---------- | --------------------------------- |
| `feat`     | 새로운 기능 추가                  |
| `fix`      | 버그 수정                         |
| `docs`     | 문서 수정 (README, 주석 등)       |
| `style`    | 코드 포맷팅, 세미콜론 등 (로직 변경 없음) |
| `refactor` | 리팩토링 (기능 변화 없는 코드 개선) |
| `test`     | 테스트 코드 추가/수정             |
| `chore`    | 빌드, 설정, 패키지 등 기타 변경   |

예시:
```
feat: 관광지 상세 화면 UI 구현
fix: 안드로이드에서 지도 마커 클릭 안 되는 버그 수정
chore: eslint, prettier 설정 추가
```

## 코드 컨벤션

### 포맷팅 / 린트
- 커밋 전 반드시 실행:
  ```bash
  npm run lint
  npm run format
  ```
- Prettier가 포맷을 강제하므로 스타일 논쟁은 하지 않습니다 (설정: [.prettierrc.json](.prettierrc.json)).

### 네이밍
- 컴포넌트 파일: `PascalCase.tsx` (예: `TouristSpotCard.tsx`)
- 컴포넌트가 아닌 파일(훅, 유틸): `kebab-case.ts` (예: `use-color-scheme.ts`)
- 컴포넌트/타입: `PascalCase`
- 변수/함수: `camelCase`
- 상수: `UPPER_SNAKE_CASE`
- 커스텀 훅: `use` 접두사 (예: `useTouristSpots`)

### 폴더 구조
- `src/app/`: expo-router 라우팅 전용. 실제 화면 구현은 두지 않고 `src/pages/`를 재export만 함
- `src/pages/`: 실제 화면(페이지) 구현
- `src/components/global/`: 여러 화면에서 재사용하는 공통 컴포넌트
- `src/components/{PageName}/`: 특정 화면에서만 쓰는 컴포넌트 (예: `src/components/Home/`)
- `src/api/`: 백엔드 통신(axios) 전용. fetch/axios 호출은 여기서만 함
- `src/types/`: 도메인별 타입 정의
- `src/hooks/`: 커스텀 훅
- `src/constants/`: 상수, 테마 값 등

폴더별로 실제 코드를 어떻게 작성하는지는 [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) 참고.

### TypeScript
- `any` 사용 금지. 타입을 모르면 `unknown` + 타입 좁히기 사용.
- 컴포넌트 props는 명시적 `interface` 또는 `type`으로 선언.
- 새 파일은 항상 `.ts` / `.tsx`로 작성 (JS 파일 추가 금지).

### 커밋하지 않는 것
- `console.log` 등 디버깅 코드
- 주석 처리된 죽은 코드
- `node_modules`, `.expo`, 빌드 산출물 (`.gitignore`에 이미 포함)

## Pull Request 규칙

1. PR은 하나의 이슈/기능에 집중합니다 (여러 작업을 한 PR에 섞지 않기).
2. PR 생성 시 템플릿의 체크리스트를 모두 채워주세요.
3. 최소 1명의 리뷰 승인 후 merge합니다.
4. merge 방식은 **Squash and merge**를 사용해 `main`의 커밋 히스토리를 깔끔하게 유지합니다.
5. merge 후 브랜치는 삭제합니다.

## 이슈 규칙

- 작업 시작 전 이슈를 먼저 등록합니다 (버그 / 기능 제안 / 작업 템플릿 중 선택).
- 담당자는 이슈에 자신을 assign 합니다.
- 이슈 제목은 `[Bug]`, `[Feat]`, `[Task]` 접두사를 유지합니다 (템플릿 자동 적용).

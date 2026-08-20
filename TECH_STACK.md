# 기술 스택 (Tech Stack)

경주 익스플로러 프로젝트의 프론트엔드 / 백엔드 기술 스택 정리 문서입니다.

## 프론트엔드

| 항목 | 선택 |
|---|---|
| 프레임워크 | Expo (SDK 57) + Expo Router (파일 기반 라우팅) |
| 언어 | TypeScript |
| 런타임 | React Native 0.86.2, React 19.2.3 |
| 웹 지원 | react-native-web (모바일 + 웹 동시 타겟) |
| UI / 애니메이션 | react-native-reanimated, react-native-gesture-handler, expo-glass-effect, @expo/ui |
| 린트 / 포맷 | ESLint (eslint-config-expo) + Prettier |
| 패키지 매니저 | npm |

## 백엔드

| 항목 | 선택 |
|---|---|
| 프레임워크 | Spring Boot |
| 언어 | Java |
| DB | MySQL (AWS RDS 프리티어) |
| 서버 호스팅 | AWS EC2 (프리티어) |
| 인증 | Spring Security + JWT (자체 회원가입/로그인만 사용, 소셜 로그인 없음) |
| 비밀번호 저장 | BCrypt |
| ORM | Spring Data JPA |
| 스키마 마이그레이션 | Flyway |
| API 문서화 | Springdoc OpenAPI (Swagger) |
| 미션 인증 로직 | GPS 좌표 거리 계산 (Haversine 공식) — 이미지 유사도 비교는 사용하지 않음 |

## 미확정 / 논의 필요

- **인증 사진 저장 여부**: GPS만으로 미션 인증 처리하되, 완료 기록/갤러리용으로 사진을 업로드·보관할지 결정 필요. 저장한다면 AWS S3 추가.

## 협업 규칙

브랜치 전략, 커밋 컨벤션, 코드 컨벤션은 [CONTRIBUTING.md](CONTRIBUTING.md) 참고.

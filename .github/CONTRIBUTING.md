# Contributing to AniVoice

기여에 관심을 가져주셔서 감사합니다! 이 가이드가 시작하는 데 도움이 될 것입니다.

## Getting Started

### 사전 준비

- Node.js 18+
- npm 9+
- Git

### 설정

```bash
git clone https://github.com/perso-devrel/anivoice.git
cd anivoice
cp .env.example .env
npm install
```

### 개발

```bash
# 개발 서버
npm run dev

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint

# 테스트
npm run test
```

## How to Contribute

### 버그 보고

1. 기존 이슈를 먼저 확인해주세요
2. **Bug Report** 이슈 템플릿을 사용해주세요
3. 재현 단계, 기대 동작 vs 실제 동작을 포함해주세요

### 기능 제안

1. **Feature Request** 이슈를 열어주세요
2. 사용 사례와 제안하는 해결 방법을 설명해주세요

### Pull Request

1. 이 저장소를 Fork합니다
2. `develop`에서 기능 브랜치를 생성합니다: `git checkout -b feat/my-feature develop`
3. 변경사항을 작성합니다
4. 테스트를 통과시킵니다: `npm run test`
5. 타입 체크를 통과시킵니다: `npx tsc --noEmit`
6. Conventional Commit으로 커밋합니다: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
7. Push 후 `develop`을 대상으로 PR을 생성합니다

### 브랜치 전략

- `main` — 프로덕션 코드
- `develop` — 다음 릴리스 통합 브랜치
- `feat/*`, `fix/*` — develop에서 분기한 기능/수정 브랜치

### 커밋 메시지

Conventional Commits를 따릅니다:

```
feat: 라이브러리 필터링 기능 추가
fix: 더빙 진행률 폴링 중단 버그 수정
docs: API 엔드포인트 문서 업데이트
test: 크레딧 차감 단위 테스트 추가
refactor: 프록시 헬퍼 함수 분리
```

## Code Standards

- TypeScript strict mode
- API 키나 시크릿은 클라이언트 코드에 포함 금지
- 모바일 퍼스트 반응형 디자인
- 한국어 기본 UI, 영어·일본어·중국어 지원
- 에러 핸들링 + 로딩/빈 상태/에러 상태 UI 필수

## Security

보안 취약점을 발견하셨다면 **공개 이슈로 보고하지 마세요**. [SECURITY.md](../SECURITY.md)를 참고해주세요.

## License

기여함으로써 MIT License 하에 라이선스가 적용되는 것에 동의하게 됩니다.

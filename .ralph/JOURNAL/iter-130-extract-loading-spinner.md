# Iteration 130 — extract LoadingSpinner component

## BACKLOG 항목
자가 생성 풀: 중복 인라인 CSS 로딩 스피너를 공유 컴포넌트로 추출

## 발견한 원인 / 가설
- 6개 파일에서 `border-2 border-primary-* border-t-transparent rounded-full animate-spin` 패턴이 반복
- 기존 `SpinnerIcon`은 SVG 기반 스피너로, 이 CSS border 스피너와 다른 스타일
- className prop으로 크기(w-6/w-8/w-10)와 색상(primary-400/primary-500) 커스터마이즈 가능하게 설계

## 변경 파일 목록과 이유
- `src/components/icons.tsx` — `LoadingSpinner` 컴포넌트 추가
- `src/App.tsx` — 2개 인라인 스피너 → `LoadingSpinner` 교체
- `src/pages/DashboardPage.tsx` — 2개 인라인 스피너 → `LoadingSpinner` 교체
- `src/pages/LibraryDetailPage.tsx` — 1개 인라인 스피너 → `LoadingSpinner` 교체
- `src/pages/StudioPage.tsx` — 1개 인라인 스피너 → `LoadingSpinner` 교체

## 검증 결과
- `npm run build` ✔ (256.95KB 메인 번들)
- `npm run test` ✔ (376 passed)
- `dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)

## 다음 루프가 알아야 할 주의사항
- Perso API 서버 500 에러 지속 중 — exit 77
- P2 미완료 2개(다운로드 URL HEAD 검증, 다국어 회귀)는 여전히 API 의존
- 이슈 #359, PR #360 (develop), PR #361 (main)

# iter-131 — extract AuthPage inline Google SVG to shared GoogleIcon

## BACKLOG 항목
자가 생성: AuthPage 인라인 Google 로고 SVG를 공유 GoogleIcon 컴포넌트로 추출

## 배경
- 직전 dub-flow 회귀 테스트 실패 로그 확인: exit 77 (Perso API 500 upstream-down) — 코드 회귀 아님
- P2 미완료 2개 모두 Perso API 필요하여 blocked
- 코드베이스 탐색 결과 AuthPage에 인라인 Google 로고 SVG 4개 path 발견
- 기존 iter-104~iter-130에서 20개 이상 아이콘을 공유 컴포넌트로 추출한 패턴과 동일

## 변경 파일
- `src/components/icons.tsx` — GoogleIcon 컴포넌트 추가 (고정 브랜드 색상, currentColor 아님)
- `src/pages/AuthPage.tsx` — 인라인 SVG 제거, `<GoogleIcon />` import/사용

## 검증
- `npm run build` ✅ (메인 번들 257KB 유지)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream-down, 코드 회귀 아님)

## PR
- Issue: #364
- develop PR: #365 (squash merged)
- main PR: #366 (merge)

## 다음 루프 참고
- Perso API 여전히 500 — download URL HEAD 검증, 다국어 회귀 모두 blocked
- Navbar/SettingsPage의 '한국어'/'English' 문자열은 의도적 엔디님(endonym) — 수정 불필요
- 남은 인라인 SVG 없음 (모든 페이지 확인 완료)

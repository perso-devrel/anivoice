# iter-142 — hoist PricingPage inline arrays to module-level constants

## BACKLOG 항목
자가 생성 풀: 인라인 배열/객체 모듈 수준 상수 추출 (PricingPage plans + timePackages)

## 원인 / 가설
PricingPage 컴포넌트 함수 내부에 `plans: Plan[]` (60줄)과 `timePackages` (3줄) 배열이 매 렌더마다 재생성됨.
LandingPage·Navbar·DashboardPage 등에 적용한 i18n 키 패턴으로 통일 가능.

## 변경 파일
- `src/pages/PricingPage.tsx`
  - `plans` → `PLAN_CONFIGS` (모듈 수준, i18n 키 기반)
  - `timePackages` → `TIME_PACKAGE_CONFIGS` (모듈 수준, i18n 키 기반)
  - 불필요한 `Plan` 인터페이스 삭제
  - `handleSelectPlan`/`handleBuyTime` 타입을 `typeof PLAN_CONFIGS[number]`/`typeof TIME_PACKAGE_CONFIGS[number]`로 변경
  - JSX에서 `t(plan.nameKey)`, `t(plan.periodKey)` 등으로 렌더 시점에 번역

## 검증 결과
- `npm run build` ✔ (PricingPage 9.96KB)
- `npm run test` ✔ (378 pass)
- `node .ralph/test/dub-flow.mjs` → exit 77 (Perso API 500 지속, 코드 회귀 아님)

## PR
- Issue: #417
- PR develop: #418 (squash merged)
- PR main: #419 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 — dub-flow exit 77 계속 예상
- SettingsPage `billingHistory` + StudioPage `stepLabels` 도 동일 패턴 hoisting 가능 후보

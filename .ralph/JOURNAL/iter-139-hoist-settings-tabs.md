# iter-139 — hoist SettingsPage inline tabs array to module-level constant

## BACKLOG 항목
자가 생성 풀: 인라인 배열을 모듈 수준 상수로 추출 (iter-135~138 패턴 계속)

## 발견 / 가설
- SettingsPage 컴포넌트 내부에 `tabs` 배열이 매 렌더마다 재생성됨
- i18n 키를 모듈 수준 `SETTINGS_TABS` 상수에 저장하고, 컴포넌트 내에서 `t()` 매핑만 수행하도록 변경
- dub-flow 실패는 exit 77 (Perso API 500) — 코드 회귀 아님 (iter-138과 동일)

## 변경 파일
- `src/pages/SettingsPage.tsx`: `SETTINGS_TABS` 모듈 수준 상수 추가, 컴포넌트 내부 `tabs` 인라인 배열 제거

## 검증
- `npm run build` ✅ (257KB 메인 번들 변동 없음)
- `npx vitest run` ✅ (378 tests pass)
- `dub-flow.mjs` → exit 77 (Perso API 500 지속, 코드 회귀 아님)

## PR
- Issue: #402
- PR develop: #403 (squash merged)
- PR main: #404 (merge)

## 다음 루프 참고
- Perso API 500 지속 중 — exit 77 외부 장애
- SettingsPage `billingHistory` 배열도 동일 패턴으로 추출 가능 (다음 iteration 후보)
- PricingPage `plans`/`timePackages`, LandingPage `features`/`steps`/`plans` 도 추출 후보

# iter-143 — hoist SettingsPage inline arrays to module-level constants

## BACKLOG 항목
자가 생성 풀: 인라인 배열/객체 모듈 수준 상수 추출 (SettingsPage billingHistory + basicFeatures)

## 원인 / 가설
- SettingsPage 컴포넌트 내부에 `billingHistory` 배열(i18n 키 의존, 19줄)이 매 렌더마다 재생성
- 구독 탭의 `[t('basicFeature1'), ...]` 인라인 배열도 렌더마다 재생성
- iter-142 이전 journal에서 SettingsPage가 hoisting 후보로 식별됨

## 변경 파일
- `src/pages/SettingsPage.tsx`
  - `billingHistory` → `BILLING_HISTORY_ENTRIES` (모듈 수준, descriptionKey/statusKey로 i18n 키 패턴)
  - 인라인 basicFeature 배열 → `BASIC_FEATURE_KEYS` (모듈 수준, 키 배열)
  - 컴포넌트 내에서 `.map(entry => ({ ...entry, description: t(entry.descriptionKey) }))` 패턴 사용

## 검증 결과
- `npm run build` ✔ (257KB 유지)
- `npm run test` ✔ (378 pass)
- `node .ralph/test/dub-flow.mjs` → exit 77 (Perso API 500 지속, 코드 회귀 아님)

## PR
- Issue: #422
- PR develop: #423 (squash merged)
- PR main: #424 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 — dub-flow exit 77 계속 예상
- 모든 페이지의 인라인 배열 hoisting 완료 — 다른 자가생성 카테고리로 이동 필요

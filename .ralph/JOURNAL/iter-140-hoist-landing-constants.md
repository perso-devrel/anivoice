# iter-140 — hoist LandingPage inline arrays to module-level constants

## BACKLOG 항목
자가 생성 풀: LandingPage 인라인 배열을 모듈 수준 상수로 추출 (iter-135~139 패턴 계속)

## 발견 / 가설
- LandingPage 컴포넌트 내부에 `features`, `steps`, `plans` 배열이 매 렌더마다 재생성됨
- waveform height 배열 `[3,5,2,6,4,7,...]`이 JSX 내 인라인으로 두 번 중복
- 매직 넘버 `3` (height multiplier)이 의미 없이 사용됨
- 기존 `FAQ_KEYS` 패턴에 맞춰 `FEATURE_KEYS`, `STEP_KEYS`, `PLAN_KEYS` 상수로 추출
- 아이콘은 JSX이므로 별도 `FEATURE_ICONS`/`STEP_ICONS` Record로 분리

## 변경 파일
- `src/pages/LandingPage.tsx`: 6개 모듈 수준 상수 추가 (FEATURE_KEYS, FEATURE_ICONS, STEP_KEYS, STEP_ICONS, PLAN_KEYS, WAVEFORM_ORIGINAL, WAVEFORM_DUBBED, WAVEFORM_HEIGHT_MULTIPLIER), 컴포넌트 내부 인라인 배열 제거

## 검증
- `npm run build` ✅ (257KB 메인 번들 변동 없음)
- `npx vitest run` ✅ (378 tests pass)
- `dub-flow.mjs` → exit 77 (Perso API 500 지속, 코드 회귀 아님)

## PR
- Issue: #407
- PR develop: #408 (squash merged)
- PR main: #409 (merge)

## 다음 루프 참고
- Perso API 500 지속 중 — exit 77 외부 장애
- PricingPage `plans`/`timePackages` 인라인 배열도 동일 패턴으로 추출 가능 (다음 iteration 후보)
- SettingsPage `billingHistory` 배열도 추출 후보

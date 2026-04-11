# iter-158 — remove unnecessary type assertions

## BACKLOG 항목
자가 생성 풀 → 타입 강화: 불필요한 `as` type assertion 제거

## 원인 분석
- dub-flow exit 77 — upstream Perso API 500 (코드 회귀 아님)
- 코드 수정 불필요, 자가 생성 풀에서 타입 안전성 개선 항목 선택

## 변경 파일
- `src/pages/PricingPage.tsx` — `PlanConfig` 인터페이스 추가, `PLAN_CONFIGS: PlanConfig[]` 타입 명시로 4개 `as PlanType` 제거. `handleSelectPlan` 파라미터를 `typeof PLAN_CONFIGS[number]`에서 `PlanConfig`으로 교체
- `src/components/ResultStep.tsx` — `processStage as typeof STAGE_ORDER[number]` 불필요한 assertion 제거 (props 타입이 이미 동일 union)

## 검증 결과
- `npm run build` ✔ (257KB 번들, 변동 없음)
- `npx vitest run` ✔ (384 tests pass)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500 지속, 코드 회귀 아님)

## 이슈/PR
- Issue: #496
- PR (develop): #497 (squash merged)
- PR (main): #498 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 — exit 77 정상 분류
- 추가 `as` assertion 정리 대상: persoApi.ts의 `as T` (API 응답 타입, 불가피), LandingPage `as string[]` (i18n returnObjects, 불가피)

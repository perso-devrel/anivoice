# iter-157 — fix: replace hardcoded CVC label with i18n key

## BACKLOG 항목
자가 생성 풀 — PricingPage:355 하드코딩 "CVC" 라벨 i18n 교체

## 원인
PricingPage 결제 모달에서 CVC 라벨만 하드코딩 문자열로 남아 있었음.
cardNumber, expiry 등 인접 필드는 이미 i18n 키 사용 중.

## 변경 파일
- `src/i18n/en.ts` — `pricing.cvc: 'CVC'` 추가
- `src/i18n/ko.ts` — `pricing.cvc: 'CVC'` 추가
- `src/pages/PricingPage.tsx` — 하드코딩 `"CVC"` → `t('pricing.cvc')`

## 검증
- `npm run build` ✅
- `npx vitest run` — 384 tests pass ✅
- `dub-flow.mjs` — exit 77 (upstream Perso API 500, not code regression)

## PR
- Issue: #491
- develop PR: #492 (squash merged)
- main PR: #493 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 — exit 77 upstream-down
- STATE.md 남은 항목: StudioPage:111 하드코딩 에러 메시지, PricingPage 중복 !user 가드 (실제로는 별도 함수라 중복 아님)

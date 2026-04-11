# Iteration 197 — extract PricingPage magic numbers

## BACKLOG item
자가 생성: PricingPage 매직 넘버 14개를 명명 상수로 추출

## 원인 / 가설
- 원래 mode: fix 로 진입했으나 dub-flow 실패 원인이 Perso API 500 (exit 77, upstream-down)
- 코드 회귀 아님 확인 → 다음 미완료 항목으로 전환
- BACKLOG 전부 완료 상태 → 자가 생성: PricingPage 매직 넘버 추출

## 변경 파일
- `src/utils/pricing.ts` (신규) — 14개 상수 정의
  - FREE/BASIC/PRO_PLAN_CREDITS (360000, 1080000, 3600000)
  - TIME_PACK_10/50/100_MIN_SECONDS (600, 3000, 6000)
  - TIME_PACK_10/50/100_MIN_PRICE (12, 50, 90)
  - FAKE_PAYMENT_DELAY_MS (1500)
  - MOCK_CARD_DEFAULTS (demo card data)
- `src/pages/PricingPage.tsx` — 매직 넘버를 상수 참조로 교체

## 검증 결과
- `npm run build` ✅ (PricingPage 9.58KB, 변화 미미)
- `dub-flow.mjs` exit 77 (upstream Perso API 500 — 코드 회귀 아님)
- 배포 후 재검증 예정 (exit 77 예상)

## PR
- Issue: #685
- PR develop: #686 (squash merged)
- PR main: #687 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 중 — dub-flow full pass 불가
- 매직 넘버 추출 시리즈: DashboardPage, StudioPage, PricingPage 완료. 나머지 페이지에는 추출할 만한 매직 넘버 거의 없음
- SentenceEditList.tsx:38 에 MATCHING_RATE_GOOD_THRESHOLD = 3 남아있음 (소규모)

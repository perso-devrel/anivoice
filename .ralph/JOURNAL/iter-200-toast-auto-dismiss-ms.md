# Iteration 200 — extract TOAST_AUTO_DISMISS_MS constant

## BACKLOG item
자가 생성: toastStore.ts setTimeout 4000ms 매직 넘버를 TOAST_AUTO_DISMISS_MS 명명 상수로 추출

## 원인 / 가설
- mode: fix 로 진입했으나 dub-flow 실패 원인이 Perso API 500 (exit 77, upstream-down)
- 코드 회귀 아님 확인 → 자가 생성 항목으로 전환
- iter-199 journal에서 "toastStore.ts:26 에 setTimeout 4000ms 매직 넘버 남아있음" 지적됨

## 변경 파일
- `src/stores/toastStore.ts` — setTimeout 4000ms → TOAST_AUTO_DISMISS_MS 상수로 추출

## 검증 결과
- `npm run build` ✅
- `npm run test` 382개 통과 ✅
- `dub-flow.mjs` exit 77 (upstream Perso API 500 — 코드 회귀 아님)

## PR
- Issue: #700
- PR develop: #701 (squash merged)
- PR main: #702 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 중 — dub-flow full pass 불가
- firebase.ts:45,55 에 setTimeout 500ms 매직 넘버 2개 남아있음 (MOCK_AUTH_DELAY_MS 후보)
- setTimeout 매직 넘버 시리즈 1개 남음 (firebase mock delay), 그 후 다른 자가 생성 카테고리 검토 필요

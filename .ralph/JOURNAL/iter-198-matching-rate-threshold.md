# Iteration 198 — extract MATCHING_RATE_GOOD_THRESHOLD constant

## BACKLOG item
자가 생성: SentenceEditList 매직 넘버 3을 MATCHING_RATE_GOOD_THRESHOLD 명명 상수로 추출

## 원인 / 가설
- 원래 mode: fix 로 진입했으나 dub-flow 실패 원인이 Perso API 500 (exit 77, upstream-down)
- 코드 회귀 아님 확인 → 자가 생성 항목으로 전환
- iter-197 journal에서 "SentenceEditList.tsx:38 에 MATCHING_RATE_GOOD_THRESHOLD = 3 남아있음" 지적됨

## 변경 파일
- `src/components/SentenceEditList.tsx` — 매직 넘버 3을 MATCHING_RATE_GOOD_THRESHOLD 상수로 추출

## 검증 결과
- `npm run build` ✅
- `dub-flow.mjs` exit 77 (upstream Perso API 500 — 코드 회귀 아님)
- 배포 후 재검증 예정 (exit 77 예상)

## PR
- Issue: #690
- PR develop: #691 (squash merged)
- PR main: #692 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 중 — dub-flow full pass 불가
- ProfileTab.tsx:22 에 setTimeout 2000ms 매직 넘버 남아있음 (PROFILE_SAVE_DISPLAY_MS 후보)
- 매직 넘버 추출 시리즈 거의 소진됨 — 다른 자가 생성 카테고리 검토 필요

# Iteration 199 — extract PROFILE_SAVE_DISPLAY_MS constant

## BACKLOG item
자가 생성: ProfileTab.tsx setTimeout 2000ms 매직 넘버를 PROFILE_SAVE_DISPLAY_MS 명명 상수로 추출

## 원인 / 가설
- mode: fix 로 진입했으나 dub-flow 실패 원인이 Perso API 500 (exit 77, upstream-down)
- 코드 회귀 아님 확인 → 자가 생성 항목으로 전환
- iter-198 journal에서 "ProfileTab.tsx:22 에 setTimeout 2000ms 매직 넘버 남아있음" 지적됨

## 변경 파일
- `src/components/ProfileTab.tsx` — setTimeout 2000ms → PROFILE_SAVE_DISPLAY_MS 상수로 추출

## 검증 결과
- `npm run build` ✅
- `npm run test` 382개 통과 ✅
- `dub-flow.mjs` exit 77 (upstream Perso API 500 — 코드 회귀 아님)
- 배포 후 재검증: exit 77 예상

## PR
- Issue: #695
- PR develop: #696 (squash merged)
- PR main: #697 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 중 — dub-flow full pass 불가
- toastStore.ts:26 에 setTimeout 4000ms 매직 넘버 남아있음 (TOAST_DISPLAY_MS 후보)
- firebase.ts:45,55 에 setTimeout 500ms 매직 넘버 2개 남아있음 (MOCK_AUTH_DELAY_MS 후보)
- setTimeout 매직 넘버 시리즈 2개 남음, 그 후 다른 자가 생성 카테고리 검토 필요
